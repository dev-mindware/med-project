import type React from "react"
import type { Metadata } from "next"
import { Manrope, Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://cn-iilp.ao"),
  title: {
    default: "Comissão Nacional de Língua Portuguesa de Angola",
    template: "%s | CNLP Angola",
  },
  description:
    "Portal oficial da Comissão Nacional de Língua Portuguesa de Angola - Dicionário, Gramática, Topónimos, Antropónimos, Vocabulário Ortográfico Nacional de Angola da Língua Portuguesa e recursos educativos.",
  keywords: ["língua portuguesa", "Angola", "dicionário", "gramática", "topónimos", "antropónimos", "VONALP", "educação"],
  openGraph: {
    type: "website",
    locale: "pt_AO",
    siteName: "CNLP Angola",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body className={`${manrope.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
