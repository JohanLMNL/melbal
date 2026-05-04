'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type Profile } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setState({ user: null, profile: null, loading: false })
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (cancelled) return
      setState({ user, profile, loading: false })
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (!cancelled) setState({ user: session.user, profile, loading: false })
          })
      } else {
        if (!cancelled) setState({ user: null, profile: null, loading: false })
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
