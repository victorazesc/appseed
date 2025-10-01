import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"

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
    <html lang="pt-BR">
      <Script
        src="https://www.trackmint.app/js/script.js"
        defer
        data-website-id="_Vo-Pp8MfMy8DD5myN2Kl"
        data-domain="appseed.com.br"
        data-debug="true"
        strategy="afterInteractive"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <Analytics />
        {children}
      </body>
    </html>
  );
}
