'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import Header from '@/app/components/layout/Header'
import Footer from '@/app/components/layout/Footer'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
} 