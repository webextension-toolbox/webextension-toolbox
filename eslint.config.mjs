import eslint from 'eslint';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignore patterns
  {
    ignores: ['**/dist', '**/node_modules', '**/*.js'],
  },
  
  // Base TypeScript config
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        browser: 'readonly',
        NodeJS: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      'class-methods-use-this': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['manifest', 'previousValue'],
        },
      ],
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
    },
  },
  
  // Prettier config (must be last)
  prettier
);
