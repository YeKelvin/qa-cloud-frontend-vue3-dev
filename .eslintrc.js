module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  globals: {
    defineEmits: true,
    document: true,
    jest: 'readonly',
    localStorage: true,
    window: true,
    defineProps: true,
    defineExpose: true
  },
  plugins: ['prettier', 'import'],
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
    ecmaFeatures: {
      jsx: true,
      tsx: true
    }
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      env: {
        jest: true
      }
    }
  ],
  rules: {
    // js
    'block-scoped-var': 'error',
    'linebreak-style': ['error', 'unix'],
    'no-async-promise-executor': 'off',
    'no-bitwise': 'off',
    'no-console': 'off',
    'no-var': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-void': 'error',
    'no-plusplus': 'off',
    'no-param-reassign': ['off'],
    'no-useless-escape': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'prefer-template': 'error',
    'prefer-const': ['warn', { destructuring: 'all', ignoreReadBeforeAssign: true }],

    // vue
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',

    // prettier
    'prettier/prettier': 'error',

    // import
    'import/first': 'error',
    'import/extensions': 'off',
    'import/no-duplicates': 'error',
    'import/no-unresolved': [0],
    'import/no-absolute-path': 'off',
    'import/no-extraneous-dependencies': 'off'
  }
}
