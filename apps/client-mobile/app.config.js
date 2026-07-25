const path = require('path')
const dotenv = require('dotenv')

const workspaceRoot = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(workspaceRoot, '.env') })
dotenv.config({ path: path.join(workspaceRoot, '.env.local') })
dotenv.config({ path: path.join(__dirname, '.env') })

const EXPO_FROM_NEXT = [
  'COGNITO_USER_POOL_ID',
  'COGNITO_USER_POOL_CLIENT_ID',
  'COGNITO_IDENTITY_POOL_ID',
  'REPRS_API_BASE_URL',
  'REQUIRE_HOME_SIGN_IN',
  'ALLOW_ANONYMOUS_HOME',
]

for (const suffix of EXPO_FROM_NEXT) {
  const expoKey = `EXPO_PUBLIC_${suffix}`
  const nextKey = `NEXT_PUBLIC_${suffix}`
  if (!process.env[expoKey] && process.env[nextKey]) {
    process.env[expoKey] = process.env[nextKey]
  }
}

/** @type {import('expo/config').ExpoConfig} */
const expoConfig = {
  name: 'client-mobile',
  slug: 'client-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'clientmobile',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
}

module.exports = { expo: expoConfig }
