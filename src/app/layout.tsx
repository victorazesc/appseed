import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AppSeed | MVPs e Crescimento de Produtos Digitais",
  description:
    "AppSeed é especialista em desenvolvimento de MVPs, aplicações web e crescimento pós-lançamento, com tecnologia moderna e metodologia ágil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <Script
        src="https://www.trackmint.app/js/script.js"
        defer
        data-website-id="_Vo-Pp8MfMy8DD5myN2Kl"
        data-domain="appseed.com.br"
        data-debug="true"
        strategy="afterInteractive"
      />
      <body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.variable, geistMono.variable)}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
