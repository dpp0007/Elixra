'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import UsernameSetupModal from '@/components/UsernameSetupModal'

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
        <UsernameSetupModal />
      </AuthProvider>
    </SessionProvider>
  )
}
