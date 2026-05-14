'use client'
import Script from 'next/script'

export function ExtensionErrorSuppressor() {
  return (
    <Script id="suppress-extension-errors" strategy="beforeInteractive">{`
      (function() {
        // Suppress unhandledrejection from chrome extensions
        window.addEventListener('unhandledrejection', function(e) {
          var msg = (e.reason && e.reason.message) || ''
          var stack = (e.reason && e.reason.stack) || ''
          if (msg.indexOf('Failed to fetch') !== -1 || stack.indexOf('chrome-extension') !== -1) {
            e.preventDefault()
            e.stopImmediatePropagation()
          }
        }, true)

        // Suppress error events from chrome extensions
        window.addEventListener('error', function(e) {
          var src = (e.filename || '')
          if (src.indexOf('chrome-extension') !== -1) {
            e.preventDefault()
            e.stopImmediatePropagation()
            return true
          }
        }, true)
      })()
    `}</Script>
  )
}
