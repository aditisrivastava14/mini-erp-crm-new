import eslint from '@eslint/js';

export default [
  eslint.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Add custom rules here
    },
  },
];
