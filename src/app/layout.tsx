import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/Providers";
import { LayoutContent } from "@/components/layout/LayoutContent";
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
  title: "Stablecoin Wallet - Secure Crypto Wallet for USDC, USDT & DAI",
  description: "Ultra-modern, secure Ethereum wallet for managing stablecoins. Send, receive, and track USDC, USDT, and DAI with military-grade encryption and beautiful UI.",
  keywords: ["stablecoin wallet", "crypto wallet", "USDC", "USDT", "DAI", "Ethereum wallet", "Web3 wallet"],
  authors: [{ name: "SquizAI" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://squizai-crypto-wallet.netlify.app",
    title: "Stablecoin Wallet - Secure Crypto Wallet",
    description: "Ultra-modern, secure Ethereum wallet for managing USDC, USDT, and DAI stablecoins.",
    siteName: "Stablecoin Wallet",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stablecoin Wallet - Secure Crypto Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stablecoin Wallet - Secure Crypto Wallet",
    description: "Ultra-modern, secure Ethereum wallet for managing USDC, USDT, and DAI stablecoins.",
    images: ["/og-image.png"],
    creator: "@SquizAI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
