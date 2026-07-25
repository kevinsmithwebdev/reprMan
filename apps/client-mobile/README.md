# client-mobile

Expo (React Native) client for ReprMan.

## Setup

```bash
cd apps/client-mobile
npm install   # also links ../../libs via postinstall
```

Cognito/API env comes from the repo-root `.env` (`NEXT_PUBLIC_*` mapped to `EXPO_PUBLIC_*` in `app.config.js`).

## Run

From repo root:

```bash
yarn start:mobile
yarn start:android
```

Amplify Auth needs a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (`npx expo run:android` / `run:ios`), not Expo Go.

If Metro cannot resolve `@reprman/*`, run `npm run link:libs`.
