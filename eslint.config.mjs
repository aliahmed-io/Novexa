// .eslintrc.js (or your existing ESLint file — replace its contents with this)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    // Relax TypeScript rules so `any` is allowed project-wide
    // and unused var warnings are less strict.
    rules: {
      // Allow explicit `any`
      "@typescript-eslint/no-explicit-any": "off",

      // Optional: relax "no-unsafe-*" rules that often block `any` usage
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // Allow exported functions without explicit types (optional)
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Convert unused-vars errors to warnings (keeps build from failing, still shows issues)
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],

      // Keep React/Next recommended rules as-is (leave other rules alone)
    },
  },
];

export default eslintConfig;
