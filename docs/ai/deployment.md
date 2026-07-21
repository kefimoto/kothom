# Deployment

Live at **https://kothoministries.org** (the real customer-facing domain — already wired up as a custom domain on the Vercel project, confirmed 2026-07-21). `https://kothom.vercel.app` is the underlying Vercel deployment URL/infra alias; customers never see or use it. Auto-deploys from `main` via Vercel's GitHub App integration (confirmed working 2026-07-20). The Vercel project lives under the **`kothom`** team.

**Any customer-facing URL in code (metadata, canonical links, sitemap, robots.txt, OG images, JSON-LD, etc.) must use `kothoministries.org`, never `kothom.vercel.app`.**
