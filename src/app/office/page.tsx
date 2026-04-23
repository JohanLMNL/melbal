'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase, type Reservation, type Profile, canManageReservations } from '@/lib/supabase'
import { formatEuro } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Calendar, Euro, AlertTriangle, Crown, Armchair, Wine, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'

// --- Helpers ---
function renderKindIcon(kind?: 'assises' | 'haute' | 'vip', size: 'sm' | 'md' = 'sm') {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  switch (kind) {
    case 'vip': return <Crown className={`${cls} text-yellow-500`} />
    case 'assises': return <Armchair className={`${cls} text-muted-foreground`} />
    case 'haute': return <Wine className={`${cls} text-indigo-500`} />
    default: return null
  }
}

function renderVenueLogo(venue: string, size: number = 14) {
  const src = venue === "Bal'tazar" ? '/logos/Bal_Logo.png' : '/logos/Mel_Logo.png'
  return <Image src={src} alt={venue} width={size} height={size} className="inline-block align-middle" />
}

// --- Types ---
type Venue = 'Melkior' | "Bal'tazar"

interface TableWithPosition {
  id: number
  table_number: number
  kind: 'assises' | 'haute' | 'vip'
  pos_x: number | null
  pos_y: number | null
  occupied: boolean
  occupied_by?: string | null
  occupiedByName?: string
}

// --- Main page ---
export default function OfficePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [venue, setVenue] = useState<Venue>('Melkior')
  const [profile, setProfile] = useState<Profile | null>(null)

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [tableKinds, setTableKinds] = useState<Record<string, 'assises' | 'haute' | 'vip'>>({})

  // Plan state
  const [tables, setTables] = useState<TableWithPosition[]>([])
  const [reservedTables, setReservedTables] = useState<Record<number, { status: 'en_attente' | 'arrive' | 'servi', name: string, guests: number, servedByName?: string }>>({})
  const [planLoading, setPlanLoading] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { loadProfile() }, [])
  useEffect(() => { loadTableKinds() }, [])
  useEffect(() => { loadReservations() }, [selectedDate, venue])
  useEffect(() => { loadPlanData() }, [selectedDate, venue])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
  }

  const loadTableKinds = async () => {
    try {
      const res = await fetch('/api/admin/tables/list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur API')
      const map: Record<string, 'assises' | 'haute' | 'vip'> = {}
      ;(result.tables || []).forEach((t: any) => { map[`${t.venue}:${t.table_number}`] = t.kind })
      setTableKinds(map)
    } catch (e) { console.error('Erreur chargement types de tables:', e) }
  }

  // --- Reservations ---
  const loadReservations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservations')
      .select(`*, reservation_tables (table_number), reservation_consumptions (id, consumption_type_id, quantity, consumption_type:consumption_types(id, name, sort_order))`)
      .eq('date', selectedDate)
      .eq('venue', venue)
      .order('created_at', { ascending: false })

    if (error) { toast.error('Erreur', { description: error.message }); setLoading(false); return }
    const rows = data || []
    const userIds = Array.from(new Set([...rows.map((r: any) => r.created_by).filter(Boolean), ...rows.map((r: any) => r.served_by).filter(Boolean)]))
    let profilesMap: Record<string, { username: string; role: string }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, username, role').in('id', userIds)
      profiles?.forEach((p: any) => { profilesMap[p.id] = p })
    }
    setReservations(rows.map((r: any) => ({ ...r, created_by_profile: r.created_by ? profilesMap[r.created_by] ?? null : null, served_by_profile: r.served_by ? profilesMap[r.served_by] ?? null : null })))
    setLoading(false)
  }

  const cycleStatus = async (reservation: Reservation) => {
    const next = reservation.status === 'en_attente' ? 'arrive' : reservation.status === 'arrive' ? 'servi' : 'en_attente'
    const update: Record<string, any> = { status: next }
    if (next === 'servi' && profile?.id) update.served_by = profile.id
    else if (next !== 'servi') update.served_by = null
    const { error } = await supabase.from('reservations').update(update).eq('id', reservation.id)
    if (error) toast.error('Erreur', { description: error.message })
    else { toast.success('Statut mis à jour'); loadReservations(); loadPlanData() }
  }

  const statusLabel = (s: string) => s === 'arrive' ? 'Arrivé' : s === 'servi' ? 'Servi' : 'En attente'
  const statusVariant = (s: string): 'default' | 'outline' | 'secondary' => s === 'arrive' ? 'default' : s === 'servi' ? 'secondary' : 'outline'

  const getRowClass = (venue: string, status: string) => {
    const sc = status === 'servi' ? 'opacity-40 outline outline-1 outline-green-500' : status === 'arrive' ? 'outline outline-1 outline-red-500' : ''
    return venue === "Bal'tazar" ? `${sc} bg-red-900/10 hover:bg-red-900/20` : sc
  }

  const sortedReservations = useMemo(() => {
    const statusOrder: Record<string, number> = { en_attente: 0, arrive: 1, servi: 2 }
    return [...reservations].sort((a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0))
  }, [reservations])

  // --- Plan ---
  const loadPlanData = async () => {
    setPlanLoading(true)
    try {
      const { data: tablesData, error: tablesError } = await supabase.from('tables').select('id, table_number, kind, pos_x, pos_y, occupied, occupied_by').eq('venue', venue)
      if (tablesError) throw tablesError

      const occupiedByIds = Array.from(new Set(tablesData?.filter(t => t.occupied_by).map(t => t.occupied_by) || []))
      const { data: occupiedByUsers } = await supabase.from('profiles').select('id, username').in('id', occupiedByIds.length > 0 ? occupiedByIds : ['00000000-0000-0000-0000-000000000000'])
      const occupiedByMap: Record<string, string> = {}
      occupiedByUsers?.forEach(u => { occupiedByMap[u.id] = u.username || 'Inconnu' })

      setTables(tablesData?.map(t => ({ ...t, occupiedByName: t.occupied_by ? occupiedByMap[t.occupied_by] : undefined })) || [])

      const { data: reservationsData, error: resError } = await supabase
        .from('reservations')
        .select('id, name, guests, status, served_by, reservation_tables(table_number)')
        .eq('venue', venue).eq('date', selectedDate).in('status', ['en_attente', 'arrive', 'servi'])
      if (resError) throw resError

      const serverIds = Array.from(new Set(reservationsData?.filter(r => r.served_by).map(r => r.served_by) || []))
      const { data: serversData } = await supabase.from('profiles').select('id, username').in('id', serverIds.length > 0 ? serverIds : ['00000000-0000-0000-0000-000000000000'])
      const serverMap: Record<string, string> = {}
      serversData?.forEach(s => { serverMap[s.id] = s.username || 'Inconnu' })

      const reserved: Record<number, { status: 'en_attente' | 'arrive' | 'servi', name: string, guests: number, servedByName?: string }> = {}
      reservationsData?.forEach((r: any) => {
        const status = r.status as 'en_attente' | 'arrive' | 'servi'
        r.reservation_tables?.forEach((rt: any) => {
          const tn = rt.table_number as number
          const existing = reserved[tn]
          if (!existing || status === 'servi' || (status === 'arrive' && existing.status === 'en_attente')) {
            reserved[tn] = { status, name: r.name || 'Sans nom', guests: r.guests || 0, servedByName: r.served_by ? serverMap[r.served_by] : undefined }
          }
        })
      })
      setReservedTables(reserved)
    } catch (e: any) { toast.error('Erreur', { description: e.message }) }
    finally { setPlanLoading(false) }
  }

  const toggleOccupied = async (tableId: number, current: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const updateData = !current ? { occupied: true, occupied_by: user?.id || null } : { occupied: false, occupied_by: null }
      const { error } = await supabase.from('tables').update(updateData).eq('id', tableId)
      if (error) throw error
      let userName = 'Inconnu'
      if (!current && user?.id) {
        const { data: p } = await supabase.from('profiles').select('username').eq('id', user.id).single()
        userName = p?.username || 'Inconnu'
      }
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, occupied: !current, occupied_by: updateData.occupied_by, occupiedByName: !current ? userName : undefined } : t))
      toast.success(`Table ${current ? 'libérée' : 'marquée occupée'}`)
    } catch (e: any) { toast.error('Erreur', { description: e.message }) }
  }

  const planSrc = venue === "Bal'tazar" ? '/plans/planTableBalta.png' : '/plans/planTableMelkior.png'

  const getTableStyle = (status?: string, isOccupied?: boolean) => {
    if (status === 'en_attente') return 'bg-white text-red-700 border-red-600 cursor-default bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,#dc2626_3px,#dc2626_6px)]'
    if (status === 'arrive') return 'bg-red-500 text-white border-red-600 cursor-default'
    if (status === 'servi') return 'bg-red-500 text-white border-4 border-green-500 cursor-default'
    if (isOccupied) return 'bg-orange-500 text-white border-orange-600 cursor-pointer hover:bg-orange-600'
    return 'bg-white text-black border-black cursor-pointer hover:bg-gray-100 shadow-sm'
  }

  const getTooltipText = (t: TableWithPosition) => {
    const info = reservedTables[t.table_number]
    if (info) {
      const base = `${info.name}\n${info.guests} pers.`
      if (info.status === 'servi' && info.servedByName) return `${base}\nServi par ${info.servedByName}`
      return `${base}\n${info.status === 'en_attente' ? 'En attente' : 'Arrivé'}`
    }
    if (t.occupied) return `Table ${t.table_number}\nOccupée${t.occupiedByName ? ` par ${t.occupiedByName}` : ''}`
    return `Table ${t.table_number}\nLibre`
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header compact */}
      <div className="border-b bg-card px-4 py-2 flex items-center gap-4 shrink-0">
        <h1 className="font-semibold text-lg">Office</h1>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-44 pr-8 text-sm h-9"
            />
            <Calendar className="absolute right-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="flex gap-1">
            <Button variant={venue === 'Melkior' ? 'default' : 'outline'} size="sm" onClick={() => setVenue('Melkior')}>
              Melkior
            </Button>
            <Button variant={venue === "Bal'tazar" ? 'default' : 'outline'} size="sm" onClick={() => setVenue("Bal'tazar")}>
              Bal&apos;tazar
            </Button>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Gauche : Réservations */}
        <div className="w-1/2 border-r overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Réservations – {format(new Date(selectedDate), 'EEE dd MMM', { locale: fr })}
              <Badge variant="outline" className="ml-1">{sortedReservations.length}</Badge>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : sortedReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune réservation</div>
          ) : (
            <div className="space-y-1">
              {/* En-tête */}
              <div className="grid grid-cols-[80px_1fr_60px_40px_60px_auto] gap-2 px-2.5 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>Statut</span>
                <span>Nom</span>
                <span className="text-center">Tables</span>
                <span className="text-center">Pers.</span>
                <span className="text-center">Acompte</span>
                <span>Consos</span>
              </div>
              {sortedReservations.map((r) => (
                <div
                  key={r.id}
                  className={`grid grid-cols-[80px_1fr_60px_40px_60px_auto] gap-2 items-center p-2.5 rounded-lg border text-sm ${getRowClass(r.venue, r.status)}`}
                >
                  {/* Statut cliquable */}
                  <Button variant={statusVariant(r.status)} size="sm" className="text-xs h-7 px-2 w-full" onClick={() => cycleStatus(r)}>
                    {statusLabel(r.status)}
                  </Button>
                  {/* Nom */}
                  <div className="font-semibold truncate min-w-0">
                    {r.name}
                    {r.status === 'servi' && (r as any).served_by_profile && (
                      <span className="text-[10px] font-normal text-muted-foreground ml-1">({(r as any).served_by_profile.username})</span>
                    )}
                  </div>
                  {/* Tables */}
                  <div className="flex items-center justify-center gap-1">
                    {r.reservation_tables?.map((rt, idx) => {
                      const kind = tableKinds[`${r.venue}:${rt.table_number}`]
                      return (
                        <span key={`${r.id}-${rt.table_number}-${idx}`} className="inline-flex items-center gap-0.5">
                          {renderKindIcon(kind)}
                          <span className="font-bold text-sm">{rt.table_number}</span>
                        </span>
                      )
                    })}
                  </div>
                  {/* Guests */}
                  <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">{r.guests}</span>
                  </div>
                  {/* Acompte */}
                  <div className="text-center text-xs text-muted-foreground">
                    {(r.deposit_cents || 0) > 0 ? formatEuro(r.deposit_cents) : '–'}
                  </div>
                  {/* Consommations */}
                  <div className="flex flex-wrap gap-1">
                    {r.reservation_consumptions && r.reservation_consumptions.length > 0 ? (
                      r.reservation_consumptions.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {c.quantity}x {(c as any).consumption_type?.name ?? `#${c.consumption_type_id}`}
                        </Badge>
                      ))
                    ) : null}
                  </div>
                </div>
              ))}
              {/* Totaux */}
              <div className="pt-2 mt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>Total : {sortedReservations.reduce((s, r) => s + (r.guests || 0), 0)} pers.</span>
                <span>{formatEuro(sortedReservations.reduce((s, r) => s + (r.deposit_cents || 0), 0))} d&apos;acomptes</span>
              </div>
            </div>
          )}
        </div>

        {/* Droite : Plan */}
        <div className="w-1/2 overflow-y-auto p-4 flex flex-col">
          <h2 className="font-semibold text-base flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4" />
            Plan – {venue}
          </h2>

          {planLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="relative w-full border rounded-md bg-muted">
                <Image src={planSrc} alt={`Plan ${venue}`} width={1200} height={800} className="w-full h-auto" />
                <div className="absolute inset-0">
                  {tables.map((t) => {
                    const hasPos = typeof t.pos_x === 'number' && typeof t.pos_y === 'number'
                    if (!hasPos) return null
                    const info = reservedTables[t.table_number]
                    const isReserved = !!info
                    const isTooltipVisible = activeTooltip === t.table_number

                    return (
                      <div
                        key={t.id}
                        className="absolute group"
                        style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)', zIndex: isTooltipVisible ? 999 : 50 }}
                      >
                        {/* Tooltip */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[1000] transition-opacity duration-200 ${isTooltipVisible ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                          <div className="bg-black text-white text-xs px-2 py-1.5 rounded shadow-lg whitespace-pre text-center min-w-[80px]">
                            {getTooltipText(t)}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`rounded-full border-2 text-xs font-bold flex items-center justify-center transition-colors w-8 h-8 ${getTableStyle(info?.status, t.occupied)}`}
                          onClick={() => !isReserved && toggleOccupied(t.id, t.occupied)}
                          onMouseEnter={() => setActiveTooltip(t.table_number)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          disabled={isReserved}
                        >
                          {t.table_number}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Légende compacte */}
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-black"></span>
                  <span>Libre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500 border-2 border-orange-600"></span>
                  <span>Occupée</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-red-600 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#dc2626_2px,#dc2626_4px)]"></span>
                  <span>En attente</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600"></span>
                  <span>Arrivé</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 border-4 border-green-500"></span>
                  <span>Servi</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
