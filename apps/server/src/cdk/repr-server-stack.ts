import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigwv2Auth from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as kms from 'aws-cdk-lib/aws-kms'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as snsSubs from 'aws-cdk-lib/aws-sns-subscriptions'
import * as path from 'node:path'
import { Construct } from 'constructs'
import { API_ROUTES, HttpMethod } from '../lib/apiRoutes'
import { STRIPE_CUSTOMER_INDEX_NAME } from '../lib/config'
import { firstNonEmpty } from './utils'

export type ReprStage = 'dev' | 'prod'

export interface ReprServerStackProps extends cdk.StackProps {
  stage: ReprStage
  /** Browser origins allowed for CORS (e.g. local Vite + prod site). */
  corsAllowOrigins: string[]
}

export class ReprServerStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool

  public readonly userPoolClient: cognito.UserPoolClient

  public readonly httpApi: apigwv2.HttpApi

  public readonly apiBaseUrlOutput: cdk.CfnOutput

  public readonly userPoolIdOutput: cdk.CfnOutput

  public readonly userPoolClientIdOutput: cdk.CfnOutput

  public readonly noActionsAlarm?: cloudwatch.Alarm

  constructor(scope: Construct, id: string, props: ReprServerStackProps) {
    super(scope, id, props)

    const { stage, corsAllowOrigins } = props

    if (!corsAllowOrigins.length) {
      throw new Error(
        'ReprServerStack: corsAllowOrigins must include at least one origin'
      )
    }

    cdk.Tags.of(this).add('Stage', stage)

    const apiScopes = String(this.node.tryGetContext('apiScopes') ?? '')
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean)

    const table = new dynamodb.Table(this, 'ReprsTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
    })

    table.addGlobalSecondaryIndex({
      indexName: STRIPE_CUSTOMER_INDEX_NAME,
      partitionKey: {
        name: 'stripeCustomerId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
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
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      environment: {
        STAGE: stage,
        REPRS_TABLE_NAME: table.tableName,
        DAILY_USAGE_TABLE_NAME: dailyUsageTable.tableName,
        DEFAULT_MAX_REPRS_ALLOWED: String(
          this.node.tryGetContext('defaultMaxReprsAllowed') ?? '25'
        ),
        DEFAULT_TRIAL_DAYS: String(
          this.node.tryGetContext('defaultTrialDays') ?? '90'
        ),
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
        STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID ?? '',
        STRIPE_CHECKOUT_SUCCESS_URL:
          process.env.STRIPE_CHECKOUT_SUCCESS_URL ?? '',
        STRIPE_CHECKOUT_CANCEL_URL:
          process.env.STRIPE_CHECKOUT_CANCEL_URL ?? '',
        STRIPE_PORTAL_RETURN_URL: process.env.STRIPE_PORTAL_RETURN_URL ?? '',
        APP_VERSION: process.env.APP_VERSION ?? 'unknown',
        APP_BUILD_NUMBER: process.env.APP_BUILD_NUMBER ?? 'local',
        APP_BUILD_TIME_UTC: process.env.APP_BUILD_TIME_UTC ?? 'unknown',
        APP_GIT_SHA: process.env.APP_GIT_SHA ?? 'unknown',
        RATE_LIMIT_GLOBAL_PER_DAY: String(
          this.node.tryGetContext('rateLimitGlobalPerDay') ?? '1000'
        ),
        RATE_LIMIT_READ_PER_HOUR: String(
          this.node.tryGetContext('rateLimitReadPerHour') ?? '300'
        ),
        RATE_LIMIT_READ_PER_DAY: String(
          this.node.tryGetContext('rateLimitReadPerDay') ?? '3000'
        ),
        RATE_LIMIT_WRITE_PER_HOUR: String(
          this.node.tryGetContext('rateLimitWritePerHour') ?? '60'
        ),
        RATE_LIMIT_WRITE_PER_DAY: String(
          this.node.tryGetContext('rateLimitWritePerDay') ?? '500'
        ),
        RATE_LIMIT_PRACTICE_PER_HOUR: String(
          this.node.tryGetContext('rateLimitPracticePerHour') ?? '120'
        ),
        RATE_LIMIT_PRACTICE_PER_DAY: String(
          this.node.tryGetContext('rateLimitPracticePerDay') ?? '800'
        ),
        RATE_LIMIT_BILLING_SESSION_PER_HOUR: String(
          this.node.tryGetContext('rateLimitBillingSessionPerHour') ?? '10'
        ),
        RATE_LIMIT_BILLING_SESSION_PER_DAY: String(
          this.node.tryGetContext('rateLimitBillingSessionPerDay') ?? '30'
        ),
        RATE_LIMIT_TERMS_PER_HOUR: String(
          this.node.tryGetContext('rateLimitTermsPerHour') ?? '20'
        ),
        RATE_LIMIT_TERMS_PER_DAY: String(
          this.node.tryGetContext('rateLimitTermsPerDay') ?? '50'
        ),
      },
    })

    table.grantReadWriteData(reprHandler)
    dailyUsageTable.grantWriteData(reprHandler)

    const poolRemovalPolicy =
      stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `reprman-user-pool-${stage}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      userVerification: {
        emailSubject: 'Confirm your ReprMan account - reprman.com',
        emailBody:
          'Thanks for signing up. Your confirmation code is {####}. It expires in 24 hours.',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      removalPolicy: poolRemovalPolicy,
    })

    this.userPoolClient = this.userPool.addClient('WebClient', {
      userPoolClientName: `reprman-web-${stage}`,
      generateSecret: false,
      disableOAuth: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
    })

    this.httpApi = new apigwv2.HttpApi(this, 'ReprApi', {
      apiName: `repr-api-${stage}`,
      corsPreflight: {
        allowOrigins: corsAllowOrigins,
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.PATCH,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['authorization', 'content-type'],
      },
    })

    const authorizer = new apigwv2Auth.HttpUserPoolAuthorizer(
      'CognitoAuthorizer',
      this.userPool,
      {
        userPoolClients: [this.userPoolClient],
      }
    )

    const integration = new apigwv2Integrations.HttpLambdaIntegration(
      'ReprIntegration',
      reprHandler
    )

    const httpMethodMap: Record<HttpMethod, apigwv2.HttpMethod> = {
      GET: apigwv2.HttpMethod.GET,
      POST: apigwv2.HttpMethod.POST,
      PUT: apigwv2.HttpMethod.PUT,
      PATCH: apigwv2.HttpMethod.PATCH,
      DELETE: apigwv2.HttpMethod.DELETE,
    }

    const addProtectedRoute = (
      routePath: string,
      methods: apigwv2.HttpMethod[]
    ) => {
      this.httpApi.addRoutes({
        path: routePath,
        methods,
        integration,
        authorizer,
        authorizationScopes: apiScopes.length > 0 ? apiScopes : undefined,
      })
    }

    const addPublicRoute = (
      routePath: string,
      methods: apigwv2.HttpMethod[]
    ) => {
      this.httpApi.addRoutes({
        path: routePath,
        methods,
        integration,
      })
    }

    API_ROUTES.forEach((route) => {
      const methods = route.methods.map((method) => httpMethodMap[method])
      if (route.requiresAuth) {
        addProtectedRoute(route.apiGatewayPath, methods)
      } else {
        addPublicRoute(route.apiGatewayPath, methods)
      }
    })

    this.apiBaseUrlOutput = new cdk.CfnOutput(this, 'ApiBaseUrl', {
      value: this.httpApi.apiEndpoint,
      description: 'HTTP API base URL (no trailing slash)',
    })

    const defaultStage = this.httpApi.defaultStage?.node.defaultChild as
      | apigwv2.CfnStage
      | undefined
    if (defaultStage) {
      defaultStage.defaultRouteSettings = {
        throttlingBurstLimit: Number(
          this.node.tryGetContext('apiDefaultThrottleBurst') ?? '50'
        ),
        throttlingRateLimit: Number(
          this.node.tryGetContext('apiDefaultThrottleRate') ?? '20'
        ),
      }
    }

    this.userPoolIdOutput = new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    })

    this.userPoolClientIdOutput = new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    })

    const actionCountMetric = new cloudwatch.Metric({
      namespace: 'ReprMan/Product',
      metricName: 'ActionCount',
      statistic: 'Sum',
      period: cdk.Duration.days(1),
      dimensionsMap: { Environment: stage },
    })

    if (stage === 'prod') {
      this.noActionsAlarm = new cloudwatch.Alarm(this, 'NoActionsInDayAlarm', {
        metric: actionCountMetric,
        threshold: 1,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        alarmDescription: 'No user actions were tracked in the last 24 hours.',
      })
    }

    const billingAlertEmail = firstNonEmpty(
      process.env.CDK_BILLING_ALERT_EMAIL,
      this.node.tryGetContext('billingAlertEmail') as string | undefined
    )
    const monthlyBudgetUsdRaw = this.node.tryGetContext('monthlyBudgetUsd') as
      | string
      | undefined
    const monthlyBudgetUsd = Number(monthlyBudgetUsdRaw ?? '25')

    if (billingAlertEmail && stage === 'prod') {
      const billingAlertsKey = new kms.Key(this, 'BillingAlertsKey', {
        enableKeyRotation: true,
        description: `Encrypts ReprMan billing alert SNS messages (${stage})`,
      })

      const topic = new sns.Topic(this, 'BillingAlertsTopic', {
        displayName: `ReprMan Billing Alerts (${stage})`,
        masterKey: billingAlertsKey,
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
