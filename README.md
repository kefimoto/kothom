KOTHOM (Knights of the Higher Order Ministries) — a Next.js site for a Christian non-profit assisting single-parent families in Central Florida. See `PRODUCT.md` for strategy/audience/mission and `DESIGN.md` for the visual system.

## Getting Started

This project uses [Bun](https://bun.sh). First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Status

- **Phone number is a placeholder** (`689-123-4567`) — the source material had two conflicting real numbers and neither was confirmed correct as of 2026-07-20. Replace it everywhere before this goes live for real.
- **No payment processing yet.** "Become a Knight" and "Legacy Donations" currently link to `mailto:`, not a real Stripe checkout — donations aren't actually collectible through the site yet.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project is deployed on [Vercel](https://vercel.com). Keep that in mind for any infra-adjacent decisions (image remote patterns, environment variables, edge vs. serverless functions) — favor Vercel-native patterns over host-agnostic workarounds.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

See `CONTRIBUTING.md` for local setup and how CI/CD and PR approval work, including the extra approval steps for PRs from forks.

## License

Licensed under [Apache License 2.0](LICENSE.md) — the code is free to reuse and modify for any purpose. The KOTHOM name and logo are not covered and shouldn't be reused; see the Trademark & Brand Notice at the top of `LICENSE.md`.
