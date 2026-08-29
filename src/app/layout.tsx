import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://trade-twin.vercel.app",
  ),
  title: "TradeTwin — Beat Your Trading Self",
  description:
    "AI behavioural model of your crypto trading history. Compete against your Trading Twin in risk-free simulations.",
  icons: {
    icon: [{ url: "/tradetwin-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/tradetwin-logo.svg", type: "image/svg+xml" }],
    shortcut: "/tradetwin-logo.svg",
  },
  openGraph: {
    title: "TradeTwin",
    description:
      "Beat your Trading Twin — behavioural AI on Monad Testnet.",
    images: [{ url: "/tradetwin-logo.svg", width: 64, height: 64, alt: "TradeTwin" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col text-[var(--text-heading)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
