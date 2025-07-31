// eslint configuration

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import pluginImport from "eslint-plugin-import";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import pluginJsdoc from "eslint-plugin-jsdoc";
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
      jsdoc: pluginJsdoc,
    },
    rules: {
      ...pluginVue.configs["flat/recommended"].rules,
      ...tseslint.configs.recommended.rules,
      'import/no-unresolved': 'error',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': "off",
      'jsdoc/require-param': "off",
      'jsdoc/require-returns': "off",
      'jsdoc/require-param-type': "off",
      'jsdoc/require-param-description': "off",
      'jsdoc/require-returns-type': "off",
      'jsdoc/require-returns-description': "off"
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
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
      jsdoc: pluginJsdoc,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.recommendedTypeChecked.rules,
      ...tseslint.configs.strictTypeChecked.rules,
      'import/no-unresolved': 'error',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': "off", // make sure to write non-obvious description that don't just repeat the name, but explain purpose and how the code ties into the big picture
      'jsdoc/require-param': "off",
      'jsdoc/require-returns': "off",
      'jsdoc/require-param-type': "off",
      'jsdoc/require-param-description': "off",
      'jsdoc/require-returns-type': "off",
      'jsdoc/require-returns-description': "off"
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
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      'jsdoc/require-jsdoc': 'off',
    },
  },
], {
  ignores: ["legacy/**", "src/app/router.ts", "dist/**", ".storybook/**", "src/stories/**", "**/*.stories.ts"]
});
