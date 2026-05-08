import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigwv2Auth from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'

export class ReprServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const userPoolId = this.node.tryGetContext('userPoolId') as string
    const userPoolClientId = this.node.tryGetContext('userPoolClientId') as string
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

    const reprHandler = new lambda.Function(this, 'ReprHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/router.handler',
      code: lambda.Code.fromAsset('dist'),
      environment: {
        REPRS_TABLE_NAME: table.tableName,
        APP_VERSION: process.env.APP_VERSION ?? 'unknown',
        APP_BUILD_NUMBER: process.env.APP_BUILD_NUMBER ?? 'local',
        APP_BUILD_TIME_UTC: process.env.APP_BUILD_TIME_UTC ?? 'unknown',
        APP_GIT_SHA: process.env.APP_GIT_SHA ?? 'unknown',
      },
    })

    table.grantReadWriteData(reprHandler)

    const userPool = cognito.UserPool.fromUserPoolId(this, 'UserPool', userPoolId)
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
  }
}
