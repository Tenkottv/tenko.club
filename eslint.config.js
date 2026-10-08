import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  { languageOptions: { globals: globals.node } },
  // Callbacks passed to page.evaluate run in the browser.
  { files: ["tests/**/*.js"], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
];
