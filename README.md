# ReprMan - Repertoire Management

## Cloud Repr Backend

Repr data is now stored in AWS (DynamoDB) through an authenticated API.

- Client app: `apps/client-web`
- Backend app: `apps/server` (TypeScript Lambda handlers + CDK stack)

### Required Environment

Add these values in `.env` (see `.env.example`):

- `REACT_APP_COGNITO_USER_POOL_ID`
- `REACT_APP_COGNITO_USER_POOL_CLIENT_ID`
- `REACT_APP_REPRS_API_BASE_URL`

### Build and Test Server

- `yarn build:server`
- `yarn lint:server`
- `yarn test:server`

### Deploy CDK Stack

Run from repo root:

`nx run server:cdk:deploy -- --context userPoolId=<pool-id> --context userPoolClientId=<client-id>`