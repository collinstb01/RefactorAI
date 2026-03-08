import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RefactorAI — Your codebase, understood",
  description: "AI-powered code analysis, architecture insights, and refactoring suggestions for GitHub repositories.",
  keywords: ["AI", "Code Analysis", "Refactoring", "GitHub", "Software Architecture"],
  authors: [{ name: "RefactorAI Team" }],
  openGraph: {
    title: "RefactorAI — Your codebase, understood",
    description: "AI-powered code analysis, architecture insights, and refactoring suggestions for GitHub repositories.",
    url: "https://refactorai.devtb.xyz",
    siteName: "RefactorAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RefactorAI Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RefactorAI — Your codebase, understood",
    description: "AI-powered code analysis, architecture insights, and refactoring suggestions for GitHub repositories.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" theme="dark" />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
