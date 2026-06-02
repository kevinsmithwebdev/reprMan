import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { ReprServerStack } from './repr-server-stack'

describe('ReprServerStack', () => {
  const originalBillingEmail = process.env.CDK_BILLING_ALERT_EMAIL

  afterEach(() => {
    if (originalBillingEmail === undefined) {
      delete process.env.CDK_BILLING_ALERT_EMAIL
    } else {
      process.env.CDK_BILLING_ALERT_EMAIL = originalBillingEmail
    }
  })

  it('creates core resources for dev', () => {
    const app = new App()
    const stack = new ReprServerStack(app, 'TestDevStack', {
      stage: 'dev',
      corsAllowOrigins: ['http://localhost:3000'],
    })
    const template = Template.fromStack(stack)

    expect(
      Object.keys(template.findResources('AWS::DynamoDB::Table'))
    ).toHaveLength(2)
    expect(
      Object.keys(template.findResources('AWS::Lambda::Function'))
    ).toHaveLength(1)
    expect(
      Object.keys(template.findResources('AWS::Cognito::UserPool'))
    ).toHaveLength(1)
    expect(
      Object.keys(template.findResources('AWS::CloudWatch::Alarm'))
    ).toHaveLength(0)
  })

  it('creates a prod inactivity alarm', () => {
    const app = new App()
    const stack = new ReprServerStack(app, 'TestProdStack', {
      stage: 'prod',
      corsAllowOrigins: ['https://reprman.com'],
    })
    const template = Template.fromStack(stack)

    expect(
      Object.keys(template.findResources('AWS::CloudWatch::Alarm'))
    ).toHaveLength(1)
  })

  it('creates billing alerts when configured for prod', () => {
    process.env.CDK_BILLING_ALERT_EMAIL = 'alerts@example.com'
    const app = new App({
      context: { monthlyBudgetUsd: '30' },
    })
    const stack = new ReprServerStack(app, 'TestBillingStack', {
      stage: 'prod',
      corsAllowOrigins: ['https://reprman.com'],
    })
    const template = Template.fromStack(stack)

    expect(Object.keys(template.findResources('AWS::KMS::Key'))).toHaveLength(1)
    expect(Object.keys(template.findResources('AWS::SNS::Topic'))).toHaveLength(
      1
    )
    template.hasResourceProperties('AWS::SNS::Topic', {
      KmsMasterKeyId: Match.anyValue(),
    })
    expect(
      Object.keys(template.findResources('AWS::CloudWatch::Alarm'))
    ).toHaveLength(2)
  })

  it('applies authorization scopes when apiScopes context is set', () => {
    const app = new App({
      context: { apiScopes: 'reprman/read, reprman/write' },
    })
    const stack = new ReprServerStack(app, 'ScopedStack', {
      stage: 'dev',
      corsAllowOrigins: ['http://localhost:3000'],
    })
    const template = Template.fromStack(stack)

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      AuthorizationScopes: ['reprman/read', 'reprman/write'],
    })
    expect(
      Object.keys(template.findResources('AWS::ApiGatewayV2::Route')).length
    ).toBeGreaterThan(0)
  })

  it('throws when cors origins are empty', () => {
    const app = new App()
    expect(
      () =>
        new ReprServerStack(app, 'BadStack', {
          stage: 'dev',
          corsAllowOrigins: [],
        })
    ).toThrow(/corsAllowOrigins/)
  })
})
