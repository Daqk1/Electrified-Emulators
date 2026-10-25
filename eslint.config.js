import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
<<<<<<< HEAD
import tseslint from 'typescript-eslint'
=======
>>>>>>> 7f29c744c86dfef2cb7c0cb1265221d80fcd75bd
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
<<<<<<< HEAD
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
=======
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
>>>>>>> 7f29c744c86dfef2cb7c0cb1265221d80fcd75bd
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
<<<<<<< HEAD
=======
      parserOptions: { ecmaFeatures: { jsx: true } },
>>>>>>> 7f29c744c86dfef2cb7c0cb1265221d80fcd75bd
    },
  },
])
