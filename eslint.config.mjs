const config = {
  settings: {},
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      window: 'readonly',
      document: 'readonly',
    },
  },

  plugins: {
    '@typescript-eslint': {
      version: 'latest',
    },
  },
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  files: ['./src/**/*.js', './src/**/*.ts', './src/**/*.jsx', './src/**/*.tsx'],
  ignores: ['node_modules', 'dist', '.cache'],
  ignorePatterns: ['node_modules/**', 'dist/**', '.cache/**'],
};

export default config;
