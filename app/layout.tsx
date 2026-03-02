// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { HydrationWrapper } from '@/app/components/HydrationWrapper'

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
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'AfyaConnect',
  }
}

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
        {/* Add these to prevent extension injection */}
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
      </head>
      <body 
        className={`${inter.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationWrapper>
          <AuthProvider>
            <Providers>
              {children}
              <Toaster 
                position="top-right"
                richColors
                closeButton
                expand={true}
                duration={4000}
                theme="light"
                toastOptions={{
                  style: {
                    background: 'white',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                  className: 'font-sans',
                }}
              />
            </Providers>
          </AuthProvider>
        </HydrationWrapper>
      </body>
    </html>
  )
}