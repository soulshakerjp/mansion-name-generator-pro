import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "マンション名ジェネレーター Pro",
  description:
    "投資用一棟アパート・マンション向けに、由来のある斬新なネーミング候補を生成する実務特化アプリ。",
  applicationName: "マンション名ジェネレーター Pro",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "マンション名Pro",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/mansion-name-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/mansion-name-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/mansion-name-apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-slate-950">{children}</body>
    </html>
  );
}
