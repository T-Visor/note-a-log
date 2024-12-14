import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Note-a-log",
  description: "Offline notes with automated organization.",
}

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
        <Providers classname={inter.className}>{children}</Providers>
      </body>
    </html>
  )
}