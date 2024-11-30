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
      <body>
        <Providers classname={inter.className}>{children}</Providers>
      </body>
    </html>
  )
}