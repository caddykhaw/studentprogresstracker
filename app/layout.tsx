import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '../lib/AppComponents'
import '../styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap' // Optimize font loading
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    template: '%s | Student Progress Tracker',
    default: 'Student Progress Tracker',
  },
  description: 'Track student progress, lessons, and notes',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Student Progress Tracker',
    description: 'Track student progress, lessons, and notes',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
} 
