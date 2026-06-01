# End-to-end tests (Playwright)

Browser tests for `client-web` against a real Cognito user pool and Reprs API (typically the **Dev** stack).

## Setup

1. Configure the app (repo root `.env` or `.env.local` with `VITE_*` from `ReprServerStack-Dev` — see the main [README](../../../README.md)). Prefer `.env.local` so values match the Dev pool used by e2e.
2. Copy [env.e2e.example](./env.e2e.example) to **repository root** `.env.e2e` and set `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` for a **dedicated** test user in that pool (not your personal account). When the repr quota is full, setup and create flows use **Settings → Delete All Reprs** to reset the account automatically.
3. Install dependencies and Chromium:

```bash
yarn install
yarn test:e2e:install
```

## Run

```bash
yarn test:e2e
```

Playwright starts `yarn start` before tests unless:

- `E2E_SKIP_WEB_SERVER=1` — you must run `yarn start` yourself on port 3000
- `E2E_REUSE_EXISTING_SERVER=1` — skip starting a second server when you already have `yarn start` running

By default Playwright **always** starts its own dev server (avoids `ERR_CONNECTION_REFUSED` from a dead process on port 3000).

If authenticated tests show the **Sign In / Sign Up** wall, stop stray processes on port 3000, then run `yarn test:e2e` again so Playwright starts Vite with current `.env.local`.

Setup clears all reprs when the account is near the 100-repr limit (needs headroom for the suite). Set `E2E_SKIP_CLEAR_REPRS_ON_SETUP=1` to only clear when **+ Add Repr** is disabled.

Tests run with **one worker** because a single Vite dev server cannot reliably serve many parallel browsers.

Other commands:

- `yarn test:e2e:ui` — interactive UI mode
- `nx run client-web:test:e2e` — same via Nx

## Layout

| Path                    | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `specs/*.spec.ts`       | Playwright test files (`*.spec.ts` only)           |
| `helpers/auth.ts`       | Sign in, sign out, signup, accept terms            |
| `helpers/repr.ts`       | Create, view, edit, delete, filter, mark practiced |
| `helpers/reports.ts`    | Reports page and clipboard export                  |
| `auth.setup.ts`         | Saves authenticated storage state for most specs   |
| `playwright.config.cts` | Playwright config                                  |

### Spec files

| File                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `specs/auth-guest.spec.ts` | Sign in (unauthenticated browser)            |
| `specs/auth.spec.ts`       | Sign out (uses saved session from setup)     |
| `specs/signup.spec.ts`     | Registration (opt-in via `E2E_RUN_SIGNUP=1`) |
| `specs/repr.spec.ts`       | Repr CRUD and filters                        |
| `specs/reports.spec.ts`    | Filtered report and copy                     |

## Signup tests

Signup hits live Cognito and is **off by default**. To run:

1. Use an email domain you control (`E2E_SIGNUP_DOMAIN`).
2. Set `E2E_RUN_SIGNUP=1`.
3. For the full flow, set `E2E_SIGNUP_CONFIRM_CODE` from the verification email after the “reaches confirmation step” test, or use your mail catcher.

## Coverage

E2E files use `*.spec.ts` and live under `e2e/`. They are excluded from Vitest, Jest, and Sonar coverage (see [scripts/coverage-exclude-globs.mjs](../../../scripts/coverage-exclude-globs.mjs)).
