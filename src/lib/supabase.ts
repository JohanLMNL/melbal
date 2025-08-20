import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://datjoleofcjcpejnhddd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdGpvbGVvZmNqY3Blam5oZGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg0NTAsImV4cCI6MjA3MTIxNDQ1MH0.U_vEAveaOpGOuH_d1u3KmefEWdw2yF6Ak4WQ29z2_RY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type UserRole = 'admin' | 'server' | 'porter' | 'boss'
export type Venue = 'Melkior' | 'Bal\'tazar'
export type TableKind = 'assises' | 'haute' | 'vip'

export interface Profile {
  id: string
  username: string
  role: UserRole
  created_at: string
}

export interface Table {
  id: number
  venue: Venue
  table_number: number
  kind: TableKind
  capacity: number
  created_at: string
}

export interface Reservation {
  id: number
  venue: Venue
  name: string
  date: string
  guests: number
  deposit_cents: number | null
  phone: string | null
  notes: string | null
  arrived: boolean
  created_by: string
  created_at: string
  created_by_profile?: Profile
  reservation_tables?: { table_number: number }[]
}

export interface ReservationTable {
  reservation_id: number
  venue: Venue
  table_number: number
  date: string
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}

export function isBossOrAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin' || profile?.role === 'boss'
}

export function isServer(profile: Profile | null): boolean {
  return profile?.role === 'server'
}

export function canManageReservations(profile: Profile | null): boolean {
  return profile?.role === 'admin' || profile?.role === 'server'
}
