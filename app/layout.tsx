// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
}

export const metadata: Metadata = {
  title: {
    default: 'AfyaConnect - Connect with Health Practitioners',
    template: '%s | AfyaConnect'
  },
  description: 'Find and book consultations with Kenya\'s top health practitioners.',
  manifest: '/manifest.json',
}

// This must be a server component - NO 'use client' here
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/images/icons/ac-192x192.webp" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}