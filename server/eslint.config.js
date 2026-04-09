import js from '@eslint/js';
import globals from 'globals';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.husky/**', 'eslint.config.js'],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      unicorn,
      sonarjs,
      import: importPlugin,
    },

    rules: {
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15],

      'unicorn/prefer-node-protocol': 'error',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-top-level-await': 'off',

      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
    },
  },

  prettier,
];
