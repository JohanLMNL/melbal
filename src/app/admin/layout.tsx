'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Profile, isBossOrAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Calendar } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!isBossOrAdmin(profile)) {
    router.push('/reservations')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/reservations">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux réservations
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h2 className="font-semibold">Administration</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
