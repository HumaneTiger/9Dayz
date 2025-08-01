import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      "prettier/prettier": "error", // Prettier errors as ESLint errors
    },
    ignores: ["node_modules", "dist"],
  },
  prettierConfig, // Apply Prettier overrides last
];
