import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fix It AI - E-commerce Assistant',
  description: 'AI-powered assistant for fixing Shopify and WordPress e-commerce sites',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}
