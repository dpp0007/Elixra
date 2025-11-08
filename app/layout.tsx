import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import DndWrapper from '@/components/DndWrapper'
import Providers from '@/components/Providers'
import Footer from '@/components/Footer'
import PageLoader from '@/components/PageLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Elixra - Virtual Chem Lab',
  description: 'Interactive virtual chemistry lab for qualitative inorganic salt analysis',
  manifest: '/manifest.json',
  icons: {
    icon: '/Assets/Link logo.svg',
    shortcut: '/Assets/Link logo.svg',
    apple: '/Assets/Link logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Elixra',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <ThemeProvider>
            <DndWrapper>
              <PageLoader>
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </PageLoader>
            </DndWrapper>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}