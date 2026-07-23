KOTHOM (Knights of the Higher Order Ministries) — a Next.js site for a Christian non-profit assisting single-parent families in Central Florida. See `PRODUCT.md` for strategy/audience/mission and `DESIGN.md` for the visual system.

## Getting Started

This project uses [Bun](https://bun.sh). First, run the development server:

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. `bun dev` runs two things at once: Velite watching `content/`, and Next.

### Where things live

| To change… | Edit… |
|---|---|
| The words on a page, a news post, the homepage announcement | `content/**/*.md` — see **[`CONTENT-GUIDE.md`](CONTENT-GUIDE.md)** |
| Phone, email, address, legal/tax status | `src/lib/ministry.ts` (single source of truth) |
| Which pages exist in the nav and sitemap | `src/lib/routes.ts` |
| Page layout and structure | `src/app/**/page.tsx` |
| The visual system | `DESIGN.md` first, then `src/app/globals.css` |

Markdown in `content/` is compiled to typed JSON at build time and imported from `#site/content`. Page *chrome* (buttons, image panels, layout) stays in TSX; page *prose* comes from markdown — so content can be edited without touching, or breaking, a layout.

## Project Status

**The site cannot accept donations, and that is currently correct rather than a gap.** None of the four required filings — Florida nonprofit incorporation, EIN, IRS 501(c)(3) determination, and Florida charitable solicitation registration — are complete. **[`COMPLIANCE.md`](COMPLIANCE.md)** is the checklist, in order, with the traps.

Consequently:

- **No page claims donations are tax deductible**, and no EIN or Florida registration number appears anywhere. `LEGAL_STATUS` in `src/lib/ministry.ts` gates every such disclosure and is empty until each filing is genuinely done. Don't fill those in speculatively.
- **No payment processing.** "Become a Knight" and "Legacy Donations" open a `mailto:`. `src/components/donate-button.tsx` is the single place real checkout should attach.
- **Phone number is `689-327-6388`** — lives in one place (`src/lib/ministry.ts`), and a unit test fails the build if any content file names a number that disagrees with it.
- **One open business-model question**, flagged in `COMPLIANCE.md`: the $25 "Become a Knight" gift includes a T-shirt, which makes it a quid pro quo contribution for IRS purposes *and* a membership for Stripe's purposes — the latter is excluded from Stripe's nonprofit rate. Worth resolving before Stripe onboarding.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project is deployed on [Vercel](https://vercel.com). Keep that in mind for any infra-adjacent decisions (image remote patterns, environment variables, edge vs. serverless functions) — favor Vercel-native patterns over host-agnostic workarounds.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Documentation

There are a lot of markdown files at the root. This is which one you want:

| File | For | Read it when |
|---|---|---|
| **`CONTENT-GUIDE.md`** | The ministry | Writing a news post, an announcement, or page copy. Assumes no git, no terminal. |
| **`COMPLIANCE.md`** | The ministry + maintainers | Anything about legal status, tax-deductibility, donations, or filings. Authoritative over code comments. |
| `CONTRIBUTING.md` | Contributors | Local setup, CI, how a PR reaches production. |
| `PRODUCT.md` | Anyone changing copy or UX | Audiences, giving paths, voice. Wins on strategic choices. |
| `DESIGN.md` | Anyone changing UI | Colors, type, components, measured contrast. Wins on visual choices. |
| `CROSS-MARK.md` | Before touching the logo | It's a generated asset; don't hand-edit it. |
| `CLAUDE.md` / `AGENTS.md` | AI agents + maintainers | Standing decisions, deliberate non-choices, and the footguns that bite. |

## Contributing

See `CONTRIBUTING.md` for local setup and how CI/CD and PR approval work, including the extra approval steps for PRs from forks.

## License

Licensed under [Apache License 2.0](LICENSE.md) — the code is free to reuse and modify for any purpose. The KOTHOM name and logo are not covered and shouldn't be reused; see the Trademark & Brand Notice at the top of `LICENSE.md`.
