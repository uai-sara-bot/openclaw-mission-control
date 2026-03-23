import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { ThemeInitScript } from "@/components/layout/ThemeInitScript"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: {
    default: "Mission Control — OpenClaw",
    template: "%s — OpenClaw Mission Control",
  },
  description: "AI Agent Orchestration Dashboard for OpenClaw",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <ThemeInitScript />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-56">
            <TopBar />
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
