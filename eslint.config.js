import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginImport from "eslint-plugin-import";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";

const importResolverSettings = {
  'import/resolver': {
    typescript: {},
    alias: {
      map: [["@", "./src"]],
      extensions: [".ts", ".js", ".jsx", ".tsx", ".vue"]
    }
  }
}

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], settings: importResolverSettings },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: globals.browser }, settings: importResolverSettings },
  tseslint.configs.recommended,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
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
    settings: importResolverSettings,
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'import/no-unresolved': 'error',
    },
    settings: importResolverSettings,
  },
  {
    files: ["vite.config.ts"],
    languageOptions: { 
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.node.json',
        sourceType: 'module',
      },
    },
    rules: {
      'import/no-unresolved': 'off',
    },
    settings: importResolverSettings,
  },
]);
