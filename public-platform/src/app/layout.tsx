import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ScreenshotProtection } from "@/components/screenshot-protection"
import { Suspense } from "react"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://cn-iilp.ao"),
  title: {
    default: "Comissão Nacional de Língua Portuguesa de Angola",
    template: "%s | CNLP Angola",
  },
  description:
    "Portal oficial da Comissão Nacional de Língua Portuguesa de Angola — Dicionário, Gramática, VONA e recursos educativos.",
  keywords: ["língua portuguesa", "Angola", "dicionário", "gramática", "VONA", "educação"],
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
    <html lang="pt" suppressHydrationWarning>
      <body className={`font-sans ${plusJakarta.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ScreenshotProtection />
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
