import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knights of the Higher Order Ministries",
  description:
    "Knights of the Higher Order Ministries (KOTHOM) — join our ministry and become a member through your donation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
