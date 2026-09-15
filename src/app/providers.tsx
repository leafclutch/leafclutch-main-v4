'use client'

import { useState } from 'react'
import { AdminProvider } from './context/AdminContext'
import LoadingScreen from './components/ui/LoadingScreen'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  return (
    <AdminProvider>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {children}
    </AdminProvider>
  )
}