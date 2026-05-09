import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigwv2Auth from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as snsSubs from 'aws-cdk-lib/aws-sns-subscriptions'
import { Construct } from 'constructs'

export class ReprServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const userPoolId = this.node.tryGetContext('userPoolId') as string
    const userPoolClientId = this.node.tryGetContext(
      'userPoolClientId'
    ) as string
    const apiScopes = String(this.node.tryGetContext('apiScopes') ?? '')
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean)

    if (!userPoolId || !userPoolClientId) {
      throw new Error('Pass userPoolId and userPoolClientId via CDK context')
    }

    const table = new dynamodb.Table(this, 'ReprsTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    })

    const dailyUsageTable = new dynamodb.Table(this, 'DailyUsageTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    const reprHandler = new lambda.Function(this, 'ReprHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/router.handler',
      code: lambda.Code.fromAsset('dist'),
      environment: {
        REPRS_TABLE_NAME: table.tableName,
        DAILY_USAGE_TABLE_NAME: dailyUsageTable.tableName,
        DEFAULT_MAX_REPRS_ALLOWED: String(
          this.node.tryGetContext('defaultMaxReprsAllowed') ?? '25'
        ),
        APP_VERSION: process.env.APP_VERSION ?? 'unknown',
        APP_BUILD_NUMBER: process.env.APP_BUILD_NUMBER ?? 'local',
        APP_BUILD_TIME_UTC: process.env.APP_BUILD_TIME_UTC ?? 'unknown',
        APP_GIT_SHA: process.env.APP_GIT_SHA ?? 'unknown',
      },
    })

    table.grantReadWriteData(reprHandler)
    dailyUsageTable.grantWriteData(reprHandler)

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      'UserPool',
      userPoolId
    )
    const userPoolClient = cognito.UserPoolClient.fromUserPoolClientId(
      this,
      'UserPoolClient',
      userPoolClientId
    )

    const httpApi = new apigwv2.HttpApi(this, 'ReprApi', {
      apiName: 'repr-api',
      corsPreflight: {
        allowOrigins: [
          'http://localhost:3000',
          'https://www.reprman.com',
          'https://reprman.com',
        ],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['authorization', 'content-type'],
      },
    })

    const authorizer = new apigwv2Auth.HttpUserPoolAuthorizer(
      'CognitoAuthorizer',
      userPool,
      {
        userPoolClients: [userPoolClient],
      }
    )

    const integration = new apigwv2Integrations.HttpLambdaIntegration(
      'ReprIntegration',
      reprHandler
    )

    httpApi.addRoutes({
      path: '/reprs',
      methods: [apigwv2.HttpMethod.GET],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : undefined,
    })

    httpApi.addRoutes({
      path: '/reprs/{id}',
      methods: [apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : undefined,
    })

    httpApi.addRoutes({
      path: '/reprs/{id}/practice',
      methods: [apigwv2.HttpMethod.POST],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : undefined,
    })

    httpApi.addRoutes({
      path: '/reprs/migrate',
      methods: [apigwv2.HttpMethod.POST],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : undefined,
    })

    // eslint-disable-next-line no-new
    new cdk.CfnOutput(this, 'ApiBaseUrl', {
      value: httpApi.apiEndpoint,
    })

    const actionCountMetric = new cloudwatch.Metric({
      namespace: 'ReprMan/Product',
      metricName: 'ActionCount',
      statistic: 'Sum',
      period: cdk.Duration.days(1),
      dimensionsMap: { Environment: 'prod' },
    })

    // eslint-disable-next-line no-new
    new cloudwatch.Alarm(this, 'NoActionsInDayAlarm', {
      metric: actionCountMetric,
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
      alarmDescription: 'No user actions were tracked in the last 24 hours.',
    })

    const billingAlertEmail = this.node.tryGetContext('billingAlertEmail') as
      | string
      | undefined
    const monthlyBudgetUsdRaw = this.node.tryGetContext('monthlyBudgetUsd') as
      | string
      | undefined
    const monthlyBudgetUsd = Number(monthlyBudgetUsdRaw ?? '25')

    if (billingAlertEmail) {
      const topic = new sns.Topic(this, 'BillingAlertsTopic', {
        displayName: 'ReprMan Billing Alerts',
      })
      topic.addSubscription(new snsSubs.EmailSubscription(billingAlertEmail))

      const estimatedChargesMetric = new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        statistic: 'Maximum',
        period: cdk.Duration.hours(6),
        dimensionsMap: { Currency: 'USD' },
      })

      const billingAlarm = new cloudwatch.Alarm(
        this,
        'MonthlyEstimatedChargesAlarm',
        {
          metric: estimatedChargesMetric,
          threshold: monthlyBudgetUsd,
          evaluationPeriods: 1,
          datapointsToAlarm: 1,
          comparisonOperator:
            cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
          alarmDescription: `Estimated AWS charges crossed ${monthlyBudgetUsd} USD.`,
        }
      )

      billingAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic))
    }
  }
}
