import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "artifacts/**",
    "cache/**",
    "scripts/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Hydration / localStorage restore patterns are intentional in this app
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
