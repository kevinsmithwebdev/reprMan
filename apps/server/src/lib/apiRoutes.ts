export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiRouteDefinition = {
  /** API Gateway path template (e.g. `/reprs/{id}`). */
  apiGatewayPath: string
  methods: HttpMethod[]
  requiresAuth: boolean
}

export const API_ROUTES: ApiRouteDefinition[] = [
  { apiGatewayPath: '/user/config', methods: ['GET'], requiresAuth: true },
  { apiGatewayPath: '/user/settings', methods: ['PATCH'], requiresAuth: true },
  {
    apiGatewayPath: '/user/terms-acceptance',
    methods: ['POST'],
    requiresAuth: true,
  },
  { apiGatewayPath: '/reprs', methods: ['GET'], requiresAuth: true },
  {
    apiGatewayPath: '/reprs/{id}',
    methods: ['PUT', 'DELETE'],
    requiresAuth: true,
  },
  {
    apiGatewayPath: '/reprs/{id}/practice',
    methods: ['POST'],
    requiresAuth: true,
  },
  {
    apiGatewayPath: '/billing/checkout-session',
    methods: ['POST'],
    requiresAuth: true,
  },
  {
    apiGatewayPath: '/billing/portal-session',
    methods: ['POST'],
    requiresAuth: true,
  },
  {
    apiGatewayPath: '/billing/stripe-webhook',
    methods: ['POST'],
    requiresAuth: false,
  },
]

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)

export const apiGatewayPathToRegex = (template: string): RegExp => {
  const pattern = escapeRegex(template).replace(/\\\{[^}]+\\\}/g, '[^/]+')
  return new RegExp(`^${pattern}$`)
}

export const matchesApiPath = (path: string, template: string): boolean =>
  apiGatewayPathToRegex(template).test(path)
