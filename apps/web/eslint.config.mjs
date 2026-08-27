import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Preview admin de URLs dinámicas; Image de Next exige remotePatterns.
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
