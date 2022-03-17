const prettierConfig = require('./.prettierrc.json')

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    babelOptions: {
      presets: ['next/babel'],
    },
  },
  extends: ['price', 'plugin:@next/next/recommended'],
  ignorePatterns: [
    'next-env.d.ts',
    '.eslintrc.js',
    'jest.config.js',
    'setupTests.js',
    'babelLoaderConfig.js',
    'webpack.config.js',
    'rollup.config.js',
    'next-i18next.config.js',
    'sitemap.js',
    'newrelic.js',
    'server.js',
    'svgo.config.js',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      prettierConfig,
      {
        usePrettierrc: false,
      },
    ],
    '@next/next/no-img-element': 'off',
    '@next/next/no-document-import-in-page': 'off',
    'react/prop-types': 'off',
  },
}
