module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:n8n-nodes-base/community',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_|^index$',
      varsIgnorePattern: '^_|^IAuthenticateGeneric$|^IDataObject$|^isAddress$|^getAddress$|^getNetworkFromCredentials$|^expectedDecimals$|^startedAt$|^updatedAt$|^answeredInRound$|^statusDetails$'
    }],
    'n8n-nodes-base/node-param-description-missing-final-period': 'off',
    'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'off',
    'no-case-declarations': 'off',
    'prefer-const': 'warn',
  },
  ignorePatterns: ['dist/**', 'node_modules/**', '*.js', 'test/**', 'scripts/**'],
};
