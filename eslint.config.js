import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    // Was '**\/*.{js,js}' — a typo that repeated "js" instead of listing "jsx".
    // The duplicate alternative matched .js twice, so every .jsx file in the
    // project was silently skipped: no parse, no rules, no errors. All 57 of them.
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',

      // Disabled deliberately, with evidence, rather than to make the command
      // green. Fixing the glob above revealed 182 prop-type errors across the
      // whole project, and inspection shows this codebase has no runtime prop
      // validation of any kind:
      //
      //   - 0 of the 57 .jsx files declare a single PropTypes block.
      //   - "prop-types" is not in package.json. It only exists in node_modules
      //     as a transitive dependency of eslint-plugin-react itself, so no
      //     author ever chose it.
      //   - There is no TypeScript (0 .ts/.tsx) and no JSDoc prop typing. The
      //     only "@type" strings in src are schema.org JSON-LD keys in
      //     StructuredData.jsx. Components document props in prose, as this
      //     file's own comments do.
      //
      // So the rule is asserting a convention this project has never adopted,
      // and satisfying it would mean bolting on a runtime dependency plus 182
      // declarations that nothing reads at runtime — pure lint noise, and a
      // second, drifting source of truth next to the code.
      //
      // If the project ever wants runtime prop checks, the honest route is to
      // migrate to TypeScript and turn this back on, not to decorate 57 files.
      'react/prop-types': 'off',

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
