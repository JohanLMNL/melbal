import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { AppHeader } from '@/components/AppHeader'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MelbalApp',
  description: 'Système de réservation pour Melkior et Bal\'tazar',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <AppHeader />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
