import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import js from '@eslint/js'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'worker/**', '*.bak'] },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        HTMLElement: 'readonly',
        IntersectionObserver: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        requestAnimationFrame: 'readonly',
        MutationObserver: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
      },
    },
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    },
  },
]
