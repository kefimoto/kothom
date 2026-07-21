# Reliability principles

This site should keep working untouched for years with no maintenance. Concretely:

- **No runtime dependency on external services for core functionality.** Don't hotlink images or other assets from third-party CDNs (e.g. `images.unsplash.com`) — download and self-host them in `public/` instead (see `.impeccable/assets/image-credits.md` for sourcing/licensing records). If a third-party service goes down or changes its API, the site should be unaffected.
- Apply this same standard to future dependencies: prefer self-contained, self-hosted solutions over ones that assume an always-available external service, unless the feature genuinely requires live external data (e.g. Stripe for payments).
