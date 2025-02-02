import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Note-a-log",
  description: "Offline notes with automated organization.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>
          {`
            html, body {
              height: auto;
              margin: 0;
              padding: 0;
              overflow: hidden; /* Prevent scrollbars unless needed */
            }
          `}
        </style>
      </head>
      <body>
        <Providers className={inter.className}>{children}</Providers>
      </body>
    </html>
  )
}