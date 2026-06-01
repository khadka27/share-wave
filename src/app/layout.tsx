import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharewaves.vercel.app"),
  title: "ShareWave - Secure Pastebin Alternative & Anonymous Text Sharing",
  description: "ShareWave is the best secure Pastebin alternative for anonymous text sharing, code snippets, and files. Features burn after reading, private rooms, and instant sync.",
  keywords: [
    "Pastebin alternative",
    "secure text sharing sites",
    "anonymous text sharing",
    "burn after reading text",
    "self-destructing messages online",
    "read-once text sharing",
    "share code snippets securely",
    "private note sharing no login",
    "ephemeral text sharing"
  ],
  authors: [{ name: "ShareWave" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sharewaves.vercel.app",
    title: "ShareWave - Secure Pastebin Alternative",
    description: "Share text, code, and files securely with self-destructing messages and private rooms.",
    siteName: "ShareWave",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShareWave - Secure Pastebin Alternative",
    description: "Share text, code, and files securely with self-destructing messages and private rooms.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "dark:bg-gray-800 dark:text-white",
              style: {
                border: "1px solid",
                borderColor: "var(--border)",
                padding: "16px",
                color: "var(--foreground)",
                background: "var(--background)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
