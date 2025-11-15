import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import MainLayout from "@/components/layout/main-layout"
import { Session } from "@/types"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"; // ✅ FIX: Import headers

export const metadata: Metadata = {
  title: "Fast Food App",
  description: "Order fast food quickly and easily",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>
          <MainLayout session={session as Session}>
            {children}
          </MainLayout>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
