"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReprServerStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigwv2 = __importStar(require("aws-cdk-lib/aws-apigatewayv2"));
const apigwv2Auth = __importStar(require("aws-cdk-lib/aws-apigatewayv2-authorizers"));
const apigwv2Integrations = __importStar(require("aws-cdk-lib/aws-apigatewayv2-integrations"));
const cognito = __importStar(require("aws-cdk-lib/aws-cognito"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
class ReprServerStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const userPoolId = this.node.tryGetContext('userPoolId');
        const userPoolClientId = this.node.tryGetContext('userPoolClientId');
        if (!userPoolId || !userPoolClientId) {
            throw new Error('Pass userPoolId and userPoolClientId via CDK context');
        }
        const table = new dynamodb.Table(this, 'ReprsTable', {
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            pointInTimeRecovery: true,
        });
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
        });
        table.grantReadWriteData(reprHandler);
        const userPool = cognito.UserPool.fromUserPoolId(this, 'UserPool', userPoolId);
        const userPoolClient = cognito.UserPoolClient.fromUserPoolClientId(this, 'UserPoolClient', userPoolClientId);
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
        });
        const authorizer = new apigwv2Auth.HttpUserPoolAuthorizer('CognitoAuthorizer', userPool, {
            userPoolClients: [userPoolClient],
        });
        const integration = new apigwv2Integrations.HttpLambdaIntegration('ReprIntegration', reprHandler);
        httpApi.addRoutes({
            path: '/reprs',
            methods: [apigwv2.HttpMethod.GET],
            integration,
            authorizer,
        });
        httpApi.addRoutes({
            path: '/reprs/{id}',
            methods: [apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE],
            integration,
            authorizer,
        });
        httpApi.addRoutes({
            path: '/reprs/{id}/practice',
            methods: [apigwv2.HttpMethod.POST],
            integration,
            authorizer,
        });
        httpApi.addRoutes({
            path: '/reprs/migrate',
            methods: [apigwv2.HttpMethod.POST],
            integration,
            authorizer,
        });
        // eslint-disable-next-line no-new
        new cdk.CfnOutput(this, 'ApiBaseUrl', {
            value: httpApi.apiEndpoint,
        });
    }
}
exports.ReprServerStack = ReprServerStack;
//# sourceMappingURL=repr-server-stack.js.map