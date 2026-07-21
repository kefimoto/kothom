import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, PT_Serif } from "next/font/google";
import { OrganizationSchema } from "@/components/organization-schema";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MINISTRY, SITE_URL } from "@/lib/ministry";
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-cinzel-decorative",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cinzel",
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
});

const TITLE = MINISTRY.name;
const DESCRIPTION =
  "Knights of the Higher Order Ministries (KOTHOM) — spreading His word, one family at a time. Get help, or become a Knight through an annual gift or a legacy gift.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Interior pages set their own title; this template frames it. The homepage
  // overrides with `absolute` so it doesn't read "Home | Knights of the...".
  title: {
    default: TITLE,
    template: `%s | ${TITLE}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzelDecorative.variable} ${cinzel.variable} ${ptSerif.variable}`}
    >
      <body>
        <OrganizationSchema />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-none focus:bg-cream focus:px-4 focus:py-2 focus:font-headline focus:text-ink"
        >
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </html>
  );
}
