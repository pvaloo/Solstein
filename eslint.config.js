import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist",
      "original_files",
      "operator-chrome.js",
      "solstein-dropdown.js",
      "solstein-toast.js",
      "user-menu.js",
      "src/SolDropdown.jsx",
      "src/[a-z]*.jsx",
      "src/canvasRender.js",
      "src/categories.js",
      "src/edgeTypes.js",
      "src/graph-data.js",
      "src/layoutConfigs.js",
      "src/layoutEngine.js",
      "src/layoutOverrides.js",
      "src/lensMatch.js",
      "src/nodeTypes.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
