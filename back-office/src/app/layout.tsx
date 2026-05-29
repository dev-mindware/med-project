import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import {
  Outfit,
} from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { CustomToaster } from "@/utils/feedback";
import { NuqsAdapter } from "nuqs/adapters/next/app";


const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CN-IILP - Sistema",
  description: "Sistema de Gestão Linguistíca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable}`}
    >
      <body
        className="antialiased font-sans"
        style={{ fontFamily: "var(--font-family)" }}
      >
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
          storageKey="med-project-theme"
        >
          <ReactQueryProvider>
            <NuqsAdapter>
              {children}
              <CustomToaster />
            </NuqsAdapter>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
