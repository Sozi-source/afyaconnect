import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AfyaConnect - Connect with Health Practitioners',
    template: '%s | AfyaConnect'
  },
  description: 'Find and book consultations with Kenya\'s top health practitioners. Connect with verified nutritionists, dietitians, and wellness experts.',
  keywords: ['health', 'practitioners', 'Kenya', 'consultations', 'nutritionists', 'dietitians'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
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
      </body>
    </html>
  )
}