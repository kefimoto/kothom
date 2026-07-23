import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  buildCommand: "velite --clean --strict && next build",
  framework: "nextjs",
  ignoreCommand:
    "! git diff --name-only HEAD^ HEAD | grep -qvE '^([^/]+\\.md$|docs/|\\.github/|scripts/)'",
};
