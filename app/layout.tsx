import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/app/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

// Force light mode viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
  colorScheme: 'light',
}

// Metadata with PWA support (WebP icons)
export const metadata: Metadata = {
  title: {
    default: 'AfyaConnect - Connect with Health Practitioners',
    template: '%s | AfyaConnect'
  },
  description: 'Find and book consultations with Kenya\'s top health practitioners. Connect with verified nutritionists, dietitians, and wellness experts.',
  keywords: ['health', 'practitioners', 'Kenya', 'consultations', 'nutritionists', 'dietitians'],
  authors: [{ name: 'AfyaConnect Team' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AfyaConnect'
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/icons/ac-72x72.webp', sizes: '72x72', type: 'image/webp' },
      { url: '/images/icons/ac-96x96.webp', sizes: '96x96', type: 'image/webp' },
      { url: '/images/icons/ac-128x128.webp', sizes: '128x128', type: 'image/webp' },
      { url: '/images/icons/ac-144x144.webp', sizes: '144x144', type: 'image/webp' },
      { url: '/images/icons/ac-152x152.webp', sizes: '152x152', type: 'image/webp' },
      { url: '/images/icons/ac-192x192.webp', sizes: '192x192', type: 'image/webp' },
      { url: '/images/icons/ac-384x384.webp', sizes: '384x384', type: 'image/webp' },
      { url: '/images/icons/ac-512x512.webp', sizes: '512x512', type: 'image/webp' },
    ],
    apple: [
      { url: '/images/icons/ac-152x152.webp', sizes: '152x152', type: 'image/webp' },
      { url: '/images/icons/ac-192x192.webp', sizes: '192x192', type: 'image/webp' },
    ],
    shortcut: { url: '/images/icons/ac-96x96.webp', type: 'image/webp' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        {/* Force light mode with meta tags */}
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#10b981" />
        
        {/* Apple-specific PWA meta tags */}
        <link rel="apple-touch-icon" href="/images/icons/ac-192x192.webp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AfyaConnect" />
        
        {/* Android/Chrome PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* WebP favicon for modern browsers */}
        <link rel="icon" type="image/webp" href="/images/icons/ac-96x96.webp" />
        <link rel="shortcut icon" type="image/webp" href="/images/icons/ac-96x96.webp" />
        
        {/* Force light mode CSS */}
        <style>{`
          :root {
            color-scheme: light !important;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              color-scheme: light !important;
            }
          }
        `}</style>
      </head>
      <body 
        className={`${inter.className} antialiased bg-white text-gray-900`} 
        suppressHydrationWarning
      >
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
      </body>
    </html>
  )
}