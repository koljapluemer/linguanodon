import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginImport from "eslint-plugin-import";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2022,
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
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
    files: ["**/*.ts"],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
    },
    rules: {
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
      'import/no-unresolved': 'off',
    },
  },
]);
