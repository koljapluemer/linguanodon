import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginImport from "eslint-plugin-import";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue", "**/*.ts"],
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
    },
    rules: {
      ...pluginVue.configs["flat/recommended"].rules,
      ...tseslint.configs.recommended.rules,
      'import/no-unresolved': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    files: ["vite.config.ts"],
    languageOptions: { globals: globals.node },
    parserOptions: {
      project: './tsconfig.node.json',
      sourceType: 'module',
    },
    rules: {
      'import/no-unresolved': 'off', // Vite plugins and Node built-ins may not resolve in import plugin
    },
  },
]);
