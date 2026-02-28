import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/app/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

// Separate viewport export (required in Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

// Metadata without viewport field
export const metadata: Metadata = {
  title: {
    default: 'AfyaConnect - Connect with Health Practitioners',
    template: '%s | AfyaConnect'
  },
  description: 'Find and book consultations with Kenya\'s top health practitioners. Connect with verified nutritionists, dietitians, and wellness experts.',
  keywords: ['health', 'practitioners', 'Kenya', 'consultations', 'nutritionists', 'dietitians'],
  authors: [{ name: 'AfyaConnect Team' }],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
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