import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { createRequire } from 'node:module';

// eslint-plugin-require-extensions only exposes a `require` entry point
const requireExtensions = createRequire(import.meta.url)(
  'eslint-plugin-require-extensions',
);

const files = ['**/*.ts'];

export default [
  { ignores: ['dist/', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.d.ts'] },
  { linterOptions: { reportUnusedDisableDirectives: 'off' } },
  { files, ...js.configs.recommended },
  { files, ...prettierRecommended },
  { files, ...importPlugin.flatConfigs.recommended },
  {
    files,
    plugins: { 'require-extensions': requireExtensions },
    rules: {
      'require-extensions/require-extensions': 'error',
      'require-extensions/require-index': 'error',
    },
  },
  {
    files,
    languageOptions: {
      parser: tsParser,
      globals: { ...globals.browser, ...globals.commonjs, ...globals.es2015 },
    },
    settings: {
      'import/resolver': {
        webpack: {
          env: 'development',
        },
        typescript: true,
      },
    },
  },
  ...tsPlugin.configs['flat/recommended'].map((config) => ({
    ...config,
    files,
  })),
  { files, ...importPlugin.flatConfigs.typescript },
  {
    files,
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Replace the removed `ban-types` rule, which was off
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      'import/no-named-as-default-member': 'off',
      'prefer-arrow-callback': 'error',
    },
  },
];
