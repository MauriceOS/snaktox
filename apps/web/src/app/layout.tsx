import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/theme-provider'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ClientProvider } from '../components/client-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SnaKTox - AI-Powered Snakebite Emergency Response',
  description: 'AI-powered snakebite awareness, detection, and emergency response system for Sub-Saharan Africa',
  keywords: ['snakebite', 'emergency', 'AI', 'health', 'Kenya', 'Africa', 'medical'],
  authors: [{ name: 'Maurice Osoro', url: 'https://github.com/MauriceOS' }],
  openGraph: {
    title: 'SnaKTox - AI-Powered Snakebite Emergency Response',
    description: 'AI-powered snakebite awareness, detection, and emergency response system',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem={true}
                disableTransitionOnChange={false}
              >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  )
}
