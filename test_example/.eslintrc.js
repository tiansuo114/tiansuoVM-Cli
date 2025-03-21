module.exports = {
  env: {
    node: true,
    es2021: true,
    browser: true
  },
  extends: ['plugin:vue/essential', 'eslint-config-prettier'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  plugins: ['vue', 'eslint-plugin-prettier'],
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'warn',
    'vue/no-v-model-argument': 'off'
  }
}
