'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Settings, LogOut, Shield, Calculator, Monitor, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, type Profile, isBossOrAdmin } from '@/lib/supabase'

export function AppHeader() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      } catch (e) {
        // noop
      }
    })()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Erreur de déconnexion', { description: error.message })
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <nav className="border-b bg-card relative">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/MelBal_Logo.png?v=1" alt="MelBal" width={32} height={32} priority />
            <h2 className="font-semibold">MelbalApp</h2>
          </Link>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">
              <Settings className="h-4 w-4 mr-2" /> Menu
            </Button>
            {open && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                <div className="p-1">
                  {isBossOrAdmin(profile) && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                      <Shield className="h-4 w-4" /> Administration
                    </Link>
                  )}
                  <Link href="/calendrier" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                    <Calendar className="h-4 w-4" /> Calendrier
                  </Link>
                  <Link href="/office" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                    <Monitor className="h-4 w-4" /> Office
                  </Link>
                  <Link href="/encaissement" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                    <Calculator className="h-4 w-4" /> Calculette
                  </Link>
                  <button type="button" onClick={() => { setOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
