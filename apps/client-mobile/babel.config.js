const { alias } = require('../../scripts/babel-module-aliases')

module.exports = function babelConfig(api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias,
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.native.ts',
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
          ],
        },
      ],
    ],
  }
}
