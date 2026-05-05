import * as cdk from 'aws-cdk-lib'
import { ReprServerStack } from './repr-server-stack'

const app = new cdk.App()

// eslint-disable-next-line no-new
new ReprServerStack(app, 'ReprServerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
