import { Template } from 'aws-cdk-lib/assertions'

describe('cdk app', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.resetModules()
  })

  it('creates dev and prod stacks with configured cors origins', () => {
    process.env.CDK_DEV_CORS_ORIGINS = 'http://dev.example.com'
    process.env.CDK_PROD_CORS_ORIGINS = 'https://prod.example.com'

    jest.isolateModules(() => {
      const { reprServerDevStack, reprServerProdStack } =
        // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
        require('./app') as typeof import('./app')

      const devTemplate = Template.fromStack(reprServerDevStack)
      const prodTemplate = Template.fromStack(reprServerProdStack)
      devTemplate.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: {
          AllowOrigins: ['http://dev.example.com'],
        },
      })
      prodTemplate.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: {
          AllowOrigins: ['https://prod.example.com'],
        },
      })
      expect(
        Object.keys(devTemplate.findResources('AWS::ApiGatewayV2::Api'))
      ).toHaveLength(1)
      expect(
        Object.keys(prodTemplate.findResources('AWS::ApiGatewayV2::Api'))
      ).toHaveLength(1)
    })
  })

  it('falls back to default cors origins when env values are blank', () => {
    process.env.CDK_DEV_CORS_ORIGINS = '   '
    process.env.CDK_PROD_CORS_ORIGINS = ''

    jest.isolateModules(() => {
      const { reprServerDevStack } =
        // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
        require('./app') as typeof import('./app')
      const template = Template.fromStack(reprServerDevStack)
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: {
          AllowOrigins: ['http://localhost:3000'],
        },
      })
      expect(
        Object.keys(template.findResources('AWS::ApiGatewayV2::Api'))
      ).toHaveLength(1)
    })
  })

  it('uses comma-separated cors origins and ignores empty entries', () => {
    process.env.CDK_DEV_CORS_ORIGINS = 'http://a.com,, http://b.com '

    jest.isolateModules(() => {
      const { reprServerDevStack } =
        // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
        require('./app') as typeof import('./app')
      const template = Template.fromStack(reprServerDevStack)
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: {
          AllowOrigins: ['http://a.com', 'http://b.com'],
        },
      })
      expect(
        Object.keys(template.findResources('AWS::ApiGatewayV2::Api'))
      ).toHaveLength(1)
    })
  })

  it('falls back when comma-separated env resolves to an empty list', () => {
    process.env.CDK_DEV_CORS_ORIGINS = ' , '

    jest.isolateModules(() => {
      const { reprServerDevStack } =
        // eslint-disable-next-line global-require -- jest.isolateModules requires synchronous require
        require('./app') as typeof import('./app')
      const template = Template.fromStack(reprServerDevStack)
      template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
        CorsConfiguration: {
          AllowOrigins: ['http://localhost:3000'],
        },
      })
      expect(
        Object.keys(template.findResources('AWS::ApiGatewayV2::Api'))
      ).toHaveLength(1)
    })
  })
})
