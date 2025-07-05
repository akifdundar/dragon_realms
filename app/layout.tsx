"use client"

import { W3 } from "@w3vm/react"
import { createRoninModal, ronin } from "@roninbuilders/modal"
import "./globals.css"

const w3props = createRoninModal({
  chain: ronin,
  projectId: "123e4567-e89b-12d3-a456-426614174000", // Replace with your actual WalletConnect project ID
  SSR: true,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <W3 {...w3props} />
        {children}
      </body>
    </html>
  )
}
