"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cdk/app.ts
var cdk2 = __toESM(require("aws-cdk-lib"));

// src/cdk/repr-server-stack.ts
var cdk = __toESM(require("aws-cdk-lib"));
var apigwv2 = __toESM(require("aws-cdk-lib/aws-apigatewayv2"));
var apigwv2Auth = __toESM(require("aws-cdk-lib/aws-apigatewayv2-authorizers"));
var apigwv2Integrations = __toESM(require("aws-cdk-lib/aws-apigatewayv2-integrations"));
var cognito = __toESM(require("aws-cdk-lib/aws-cognito"));
var cloudwatch = __toESM(require("aws-cdk-lib/aws-cloudwatch"));
var cloudwatchActions = __toESM(require("aws-cdk-lib/aws-cloudwatch-actions"));
var dynamodb = __toESM(require("aws-cdk-lib/aws-dynamodb"));
var lambda = __toESM(require("aws-cdk-lib/aws-lambda"));
var sns = __toESM(require("aws-cdk-lib/aws-sns"));
var snsSubs = __toESM(require("aws-cdk-lib/aws-sns-subscriptions"));
function firstNonEmpty(...candidates) {
  const found = candidates.find((c) => {
    if (c === void 0 || c === null) return false;
    return Boolean(String(c).trim());
  });
  return found !== void 0 ? String(found).trim() : void 0;
}
var ReprServerStack = class extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { stage, corsAllowOrigins } = props;
    if (!corsAllowOrigins.length) {
      throw new Error(
        "ReprServerStack: corsAllowOrigins must include at least one origin"
      );
    }
    cdk.Tags.of(this).add("Stage", stage);
    const apiScopes = String(this.node.tryGetContext("apiScopes") ?? "").split(",").map((scope2) => scope2.trim()).filter(Boolean);
    const table = new dynamodb.Table(this, "ReprsTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true
    });
    const dailyUsageTable = new dynamodb.Table(this, "DailyUsageTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expiresAt",
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });
    const reprHandler = new lambda.Function(this, "ReprHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handlers/router.handler",
      code: lambda.Code.fromAsset("dist"),
      environment: {
        REPRS_TABLE_NAME: table.tableName,
        DAILY_USAGE_TABLE_NAME: dailyUsageTable.tableName,
        DEFAULT_MAX_REPRS_ALLOWED: String(
          this.node.tryGetContext("defaultMaxReprsAllowed") ?? "25"
        ),
        APP_VERSION: process.env.APP_VERSION ?? "unknown",
        APP_BUILD_NUMBER: process.env.APP_BUILD_NUMBER ?? "local",
        APP_BUILD_TIME_UTC: process.env.APP_BUILD_TIME_UTC ?? "unknown",
        APP_GIT_SHA: process.env.APP_GIT_SHA ?? "unknown"
      }
    });
    table.grantReadWriteData(reprHandler);
    dailyUsageTable.grantWriteData(reprHandler);
    const poolRemovalPolicy = stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
    this.userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `reprman-user-pool-${stage}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false
      },
      removalPolicy: poolRemovalPolicy
    });
    this.userPoolClient = this.userPool.addClient("WebClient", {
      userPoolClientName: `reprman-web-${stage}`,
      generateSecret: false,
      disableOAuth: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO
      ],
      authFlows: {
        userSrp: true,
        userPassword: true
      }
    });
    this.httpApi = new apigwv2.HttpApi(this, "ReprApi", {
      apiName: `repr-api-${stage}`,
      corsPreflight: {
        allowOrigins: corsAllowOrigins,
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS
        ],
        allowHeaders: ["authorization", "content-type"]
      }
    });
    const authorizer = new apigwv2Auth.HttpUserPoolAuthorizer(
      "CognitoAuthorizer",
      this.userPool,
      {
        userPoolClients: [this.userPoolClient]
      }
    );
    const integration = new apigwv2Integrations.HttpLambdaIntegration(
      "ReprIntegration",
      reprHandler
    );
    this.httpApi.addRoutes({
      path: "/user/config",
      methods: [apigwv2.HttpMethod.GET],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : void 0
    });
    this.httpApi.addRoutes({
      path: "/reprs",
      methods: [apigwv2.HttpMethod.GET],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : void 0
    });
    this.httpApi.addRoutes({
      path: "/reprs/{id}",
      methods: [apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : void 0
    });
    this.httpApi.addRoutes({
      path: "/reprs/{id}/practice",
      methods: [apigwv2.HttpMethod.POST],
      integration,
      authorizer,
      authorizationScopes: apiScopes.length > 0 ? apiScopes : void 0
    });
    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: this.httpApi.apiEndpoint,
      description: "HTTP API base URL (no trailing slash)"
    });
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId
    });
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId
    });
    const actionCountMetric = new cloudwatch.Metric({
      namespace: "ReprMan/Product",
      metricName: "ActionCount",
      statistic: "Sum",
      period: cdk.Duration.days(1),
      dimensionsMap: { Environment: stage }
    });
    if (stage === "prod") {
      new cloudwatch.Alarm(this, "NoActionsInDayAlarm", {
        metric: actionCountMetric,
        threshold: 1,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        alarmDescription: "No user actions were tracked in the last 24 hours."
      });
    }
    const billingAlertEmail = firstNonEmpty(
      process.env.CDK_BILLING_ALERT_EMAIL,
      this.node.tryGetContext("billingAlertEmail")
    );
    const monthlyBudgetUsdRaw = this.node.tryGetContext("monthlyBudgetUsd");
    const monthlyBudgetUsd = Number(monthlyBudgetUsdRaw ?? "25");
    if (billingAlertEmail && stage === "prod") {
      const topic = new sns.Topic(this, "BillingAlertsTopic", {
        displayName: `ReprMan Billing Alerts (${stage})`
      });
      topic.addSubscription(new snsSubs.EmailSubscription(billingAlertEmail));
      const estimatedChargesMetric = new cloudwatch.Metric({
        namespace: "AWS/Billing",
        metricName: "EstimatedCharges",
        statistic: "Maximum",
        period: cdk.Duration.hours(6),
        dimensionsMap: { Currency: "USD" }
      });
      const billingAlarm = new cloudwatch.Alarm(
        this,
        "MonthlyEstimatedChargesAlarm",
        {
          metric: estimatedChargesMetric,
          threshold: monthlyBudgetUsd,
          evaluationPeriods: 1,
          datapointsToAlarm: 1,
          comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
          alarmDescription: `Estimated AWS charges crossed ${monthlyBudgetUsd} USD.`
        }
      );
      billingAlarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));
    }
  }
};

// src/cdk/app.ts
var app = new cdk2.App();
var env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};
function parseCorsOriginsString(raw, fallbacks) {
  if (raw === void 0 || raw === null || !String(raw).trim()) {
    return [...fallbacks];
  }
  const list = String(raw).split(",").map((s) => s.trim()).filter(Boolean);
  return list.length > 0 ? list : [...fallbacks];
}
function firstNonEmpty2(...candidates) {
  const found = candidates.find((c) => {
    if (c === void 0 || c === null) return false;
    return Boolean(String(c).trim());
  });
  return found !== void 0 ? String(found).trim() : void 0;
}
var devCors = parseCorsOriginsString(
  firstNonEmpty2(
    process.env.CDK_DEV_CORS_ORIGINS,
    app.node.tryGetContext("devCorsOrigins")
  ),
  ["http://localhost:3000"]
);
var prodCors = parseCorsOriginsString(
  firstNonEmpty2(
    process.env.CDK_PROD_CORS_ORIGINS,
    app.node.tryGetContext("prodCorsOrigins")
  ),
  [
    "http://localhost:3000",
    "https://www.reprman.com",
    "https://reprman.com"
  ]
);
new ReprServerStack(app, "ReprServerStack-Dev", {
  env,
  stage: "dev",
  corsAllowOrigins: devCors
});
new ReprServerStack(app, "ReprServerStack-Prod", {
  env,
  stage: "prod",
  corsAllowOrigins: prodCors
});
//# sourceMappingURL=app.js.map
