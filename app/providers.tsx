'use client'
import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || ''
      const stack = event.reason?.stack || ''
      if (msg.includes('Failed to fetch') || stack.includes('chrome-extension')) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    }
    window.addEventListener('unhandledrejection', handler, true)
    return () => window.removeEventListener('unhandledrejection', handler, true)
  }, [])

  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 30px rgba(99,102,241,0.12)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </SessionProvider>
  )
}
