import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, PT_Serif } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Knights of the Higher Order Ministries",
  description:
    "Knights of the Higher Order Ministries (KOTHOM) — spreading His word, one family at a time. Get help, or become a Knight through an annual gift or a legacy gift.",
};

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
      <body>{children}</body>
    </html>
  );
}
