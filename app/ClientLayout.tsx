'use client'

import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import Header from '@/app/components/layout/Header'
import Footer from '@/app/components/layout/Footer'
import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Add mounting state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent theme flash by not rendering until mounted
  if (!mounted) {
    return (
      <html lang="en" className="h-full">
        <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
          <div style={{ visibility: 'hidden' }}>
            {children}
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
          storageKey="student-progress-theme"
        >
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