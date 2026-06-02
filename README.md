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

### End-to-end tests (Playwright)

Browser tests live in [`apps/client-web/e2e/specs`](apps/client-web/e2e/specs) (`*.spec.ts`). They need Dev Cognito/API in repo root `.env` plus test credentials in `.env.e2e` (see [`apps/client-web/e2e/README.md`](apps/client-web/e2e/README.md)).

- `yarn test:e2e:install` — install Chromium for Playwright
- `yarn test:e2e` — run the suite (starts the Vite dev server unless one is already running)
- `yarn test:e2e:ui` — debug in UI mode

### CDK stacks (Dev and Prod)

The app defines two stacks in the same AWS account:

| Stack id               | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `ReprServerStack-Dev`  | Dev API, Cognito user pool + client, DynamoDB (isolated from prod) |
| `ReprServerStack-Prod` | Production API + Cognito + DynamoDB                                |

Each stack creates its own Cognito **User Pool** and app client (no `--context userPoolId` anymore).

**Deploy from your machine** (after `yarn build:server`, from repo root):

- Dev API only: `yarn deploy:server` or `nx run server:cdk:deploy:dev`
- Prod API only (no frontend, no git promotion): `nx run server:cdk:deploy:prod`

### Branches: `main` (Dev) and `production` (Prod)

| Branch           | Role                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`main`**       | Day-to-day integration. Pushing here deploys the **Dev API** only (see Actions). Run the app locally against Dev using `.env` / `.env.local` from **`ReprServerStack-Dev`** outputs. |
| **`production`** | What ships to customers. Pushing here runs **validate → build → CDK Prod → S3 → CloudFront** (see [`.github/workflows/deploy-prod.yml`](.github/workflows/deploy-prod.yml)).         |

**Promote `main` → `production` (recommended release command):**

```bash
yarn deploy:prod
```

This runs [`scripts/promote-production.mjs`](scripts/promote-production.mjs): fast-forward `main` from `origin`, merge `origin/main` into `production` with a merge commit, and **`git push origin production`**. That push triggers the **Deploy Production** workflow — no AWS steps run on your laptop.

- First run: if `origin/production` does not exist yet, the script creates **`production`** from the current **`main`** tip and pushes it (then CI deploys).
- Optional env: `REPRMAN_MAIN_BRANCH` (default `main`), `REPRMAN_PRODUCTION_BRANCH` (default `production`).

**If `production` is already up to date with `main`**, the merge is a no-op and the push may not create a new commit — GitHub Actions might not run again. To **redeploy the same commit**, use Actions → **Deploy Production** → **Run workflow** (`workflow_dispatch`).

**Protecting `production` from casual pushes**

GitHub → **Settings** → **Branches** → **Add branch protection rule** for `production`:

- Turn on **Restrict who can push to matching branches** and allow only you (or a release role), **or** require pull request reviews and disallow direct pushes for everyone.
- If **no one** may push directly (strict PR-only), `yarn deploy:prod` from your laptop will be **rejected** unless you use a bypass or a **personal access token** with admin rights. In that case, promote by opening a **PR from `main` → `production`** and merging on GitHub instead; the same **Deploy Production** workflow still runs on merge.

Keep the repository **default branch** as **`main`** for normal development and PRs.

Optional environment variables for `cdk synth` / `cdk deploy` (same shell as the CDK process on CI or locally):

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
- **Push to `production`**: [`.github/workflows/deploy-prod.yml`](.github/workflows/deploy-prod.yml) runs the same checks, then deploys **`ReprServerStack-Prod`**, builds the SPA from stack outputs, uploads to S3, and optionally invalidates CloudFront.
- **Deploy Production** (manual): Actions → **Deploy Production** → **Run workflow** — same job as above, but without a new commit on `production` (useful to redeploy the current `production` tip).

**Repository secrets / variables** (non-exhaustive):

- AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- Optional variable: `CDK_DEV_CORS_ORIGINS` (e.g. extra dev origins beyond localhost)
- Prod workflow: `AWS_PROD_BUCKET_NAME` (or legacy `AWS_TEST_BUCKET_NAME`), optional `AWS_PROD_CLOUDFRONT_DISTRIBUTION_ID` (or legacy `AWS_CLOUDFRONT_DISTRIBUTION_ID`), optional variable `CDK_PROD_CORS_ORIGINS`, optional secret `CDK_BILLING_ALERT_EMAIL`
- Optional `VITE_*` for the prod client build: `VITE_REQUIRE_HOME_SIGN_IN`, `VITE_ALLOW_ANONYMOUS_HOME`, `VITE_COGNITO_IDENTITY_POOL_ID` (see workflow file)

### Legacy stack

If you previously deployed a single stack named **`ReprServerStack`**, it is separate from `ReprServerStack-Dev` / `ReprServerStack-Prod`. Plan migration or delete the old stack after cutover.
