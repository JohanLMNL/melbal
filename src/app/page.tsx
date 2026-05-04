'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.push('/reservations')
    } else {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <Image src="/logos/MelBal_Logo.png" alt="MelBal" width={56} height={56} priority />
        </div>
        <h1 className="text-2xl font-bold mb-2">MelbalApp</h1>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}
