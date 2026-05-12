# ReprMan - Repertoire Management

## Cloud Repr Backend

Repr data is stored in AWS (DynamoDB) through an authenticated API.

- Client app: `apps/client-web`
- Backend app: `apps/server` (TypeScript Lambda handlers + CDK stacks)

### Required environment (local frontend)

Vite reads variables from the **repository root** `.env` (see `apps/client-web/vite.config.ts`). Copy [`.env.example`](.env.example) to `.env` or `.env.local` and fill in values.

For **local UI against the Dev API**, use the CloudFormation outputs from stack `ReprServerStack-Dev` (`UserPoolId`, `UserPoolClientId`, `ApiBaseUrl`) after a deploy:

```bash
aws cloudformation describe-stacks \
  --stack-name ReprServerStack-Dev \
  --query "Stacks[0].Outputs" \
  --output table
```

Set `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_USER_POOL_CLIENT_ID`, and `VITE_REPRS_API_BASE_URL` accordingly.

### Build and test server

- `yarn build:server`
- `yarn lint:server`
- `yarn test:server`

### CDK stacks (Dev and Prod)

The app defines two stacks in the same AWS account:

| Stack id               | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `ReprServerStack-Dev`  | Dev API, Cognito user pool + client, DynamoDB (isolated from prod) |
| `ReprServerStack-Prod` | Production API + Cognito + DynamoDB                                |

Each stack creates its own Cognito **User Pool** and app client (no `--context userPoolId` anymore).

**Deploy from your machine** (after `yarn build:server`, from repo root):

- Dev: `yarn deploy:server` or `nx run server:cdk:deploy:dev`
- Prod: `nx run server:cdk:deploy:prod`

Optional environment variables for `cdk synth` / `cdk deploy` (same shell as the CDK process):

| Variable                  | Effect                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `CDK_DEV_CORS_ORIGINS`    | Comma-separated browser origins for **Dev** API CORS (default: `http://localhost:3000`)         |
| `CDK_PROD_CORS_ORIGINS`   | Comma-separated origins for **Prod** API CORS (default includes localhost + reprman.com)        |
| `CDK_BILLING_ALERT_EMAIL` | If set on **Prod** deploy, enables the monthly estimated charges alarm + SNS email subscription |

CDK context keys `devCorsOrigins` and `prodCorsOrigins` still work if you prefer `--context` instead of env vars.

Optional monitoring context (unchanged):

- `--context monthlyBudgetUsd=<number>` (default: `25`) when billing email is enabled

### GitHub Actions

- **Push to `main`**: [`.github/workflows/deploy-dev-api.yml`](.github/workflows/deploy-dev-api.yml) runs checks and deploys **`ReprServerStack-Dev`** only (no frontend upload).
- **Deploy Production** (manual): Actions → **Deploy Production** → Run workflow. Deploys **`ReprServerStack-Prod`**, builds the SPA from stack outputs, uploads to S3, and optionally invalidates CloudFront.

**Repository secrets / variables** (non-exhaustive):

- AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- Optional variable: `CDK_DEV_CORS_ORIGINS` (e.g. extra dev origins beyond localhost)
- Prod workflow: `AWS_PROD_BUCKET_NAME` (or legacy `AWS_TEST_BUCKET_NAME`), optional `AWS_PROD_CLOUDFRONT_DISTRIBUTION_ID` (or legacy `AWS_CLOUDFRONT_DISTRIBUTION_ID`), optional variable `CDK_PROD_CORS_ORIGINS`, optional secret `CDK_BILLING_ALERT_EMAIL`
- Optional `VITE_*` for the prod client build: `VITE_REQUIRE_HOME_SIGN_IN`, `VITE_ALLOW_ANONYMOUS_HOME`, `VITE_COGNITO_IDENTITY_POOL_ID` (see workflow file)

### Legacy stack

If you previously deployed a single stack named **`ReprServerStack`**, it is separate from `ReprServerStack-Dev` / `ReprServerStack-Prod`. Plan migration or delete the old stack after cutover.
