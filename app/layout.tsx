import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ExtensionErrorSuppressor } from '@/components/ui/ExtensionErrorSuppressor'

export const metadata: Metadata = {
  title: 'Employee Management System',
  description: 'Professional Employee Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ExtensionErrorSuppressor />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
