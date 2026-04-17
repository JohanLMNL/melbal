'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, type Reservation, type Profile, type Table, type ConsumptionType, type ReservationConsumption, canManageReservations } from '@/lib/supabase'
import { formatEuro } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Euro, AlertTriangle, Crown, Armchair, Wine, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'

// Helper icon renderer visible to all components in this module
function renderKindIcon(kind?: 'assises' | 'haute' | 'vip', size: 'sm' | 'md' = 'sm') {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  switch (kind) {
    case 'vip':
      return <Crown className={`${cls} text-yellow-500`} />
    case 'assises':
      return <Armchair className={`${cls} text-muted-foreground`} />
    case 'haute':
      return <Wine className={`${cls} text-indigo-500`} />
    default:
      return null
  }
}

// Helper to render venue logo
function renderVenueLogo(venue: string, size: number = 14) {
  const src = venue === "Bal'tazar" ? '/logos/Bal_Logo.png' : '/logos/Mel_Logo.png'
  return (
    <Image
      src={src}
      alt={venue}
      width={size}
      height={size}
      className="inline-block align-middle"
    />
  )
}

function ConsumptionPicker({
  consumptionTypes,
  value,
  onChange,
}: {
  consumptionTypes: ConsumptionType[]
  value: { consumption_type_id: number; quantity: number }[]
  onChange: (v: { consumption_type_id: number; quantity: number }[]) => void
}) {
  const addLine = () => {
    if (consumptionTypes.length === 0) return
    const usedIds = value.map(v => v.consumption_type_id)
    const first = consumptionTypes.find(t => !usedIds.includes(t.id))
    if (!first) return
    onChange([...value, { consumption_type_id: first.id, quantity: 1 }])
  }

  const removeLine = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const updateLine = (idx: number, field: 'consumption_type_id' | 'quantity', val: number) => {
    onChange(value.map((line, i) => i === idx ? { ...line, [field]: val } : line))
  }

  return (
    <div className="space-y-2">
      {value.map((line, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Select
            value={String(line.consumption_type_id)}
            onValueChange={(v) => updateLine(idx, 'consumption_type_id', Number(v))}
          >
            <SelectTrigger className="flex-1 min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {consumptionTypes.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="1"
            value={line.quantity}
            onChange={(e) => updateLine(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center min-h-[44px]"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(idx)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLine}
        disabled={value.length >= consumptionTypes.length}
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter un produit
      </Button>
    </div>
  )
}

function TablePlanPicker({
  venue,
  tables,
  reserved,
  reservedInfo,
  selected,
  onChange,
}: {
  venue: 'Melkior' | "Bal'tazar"
  tables: Table[]
  reserved: number[]
  reservedInfo: Record<number, { name: string, guests: number }>
  selected: number[]
  onChange: (tables: number[]) => void
}) {
  const planSrc = venue === "Bal'tazar" ? '/plans/planTableBalta.png' : '/plans/planTableMelkior.png'
  const toggle = (num: number) => {
    const next = selected.includes(num) ? selected.filter(n => n !== num) : [...selected, num]
    onChange(next)
  }
  const pillClass = (kind: any, isSelected: boolean) => {
    // Colors: haute -> blue/indigo, vip -> gold/yellow, assises -> neutral
    if (kind === 'vip') {
      return isSelected
        ? 'bg-yellow-500 text-black border-yellow-500'
        : 'bg-background/90 text-yellow-700 border-yellow-500 hover:bg-yellow-50'
    }
    if (kind === 'haute') {
      return isSelected
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-background/90 text-indigo-600 border-indigo-500 hover:bg-indigo-50'
    }
    // assises or default
    return isSelected
      ? 'bg-foreground text-background border-foreground'
      : 'bg-background/90 text-muted-foreground border-border hover:bg-accent'
  }
  return (
    <div className="space-y-4">
      <div className="relative w-full border rounded-md overflow-hidden bg-muted">
        <Image src={planSrc} alt={`Plan ${venue}`} width={1200} height={800} className="w-full h-auto select-none pointer-events-none" />
        {(() => {
          const list = (tables || [])
          const toNum = (v: any) => {
            if (v === null || typeof v === 'undefined') return undefined
            if (typeof v === 'number') return isFinite(v) ? v : undefined
            const n = parseFloat(String(v))
            return isNaN(n) ? undefined : n
          }
          const hasPos = (t: any) => toNum(t.pos_x) !== undefined && toNum(t.pos_y) !== undefined
          const positioned = list.filter((t: any) => hasPos(t))
          const unpositioned = list.filter((t: any) => !hasPos(t))
          return (
            <>
              {/* Absolute layer for positioned tables */}
              <div className="absolute inset-0 z-20">
                {positioned.map((t: any) => {
                  const px = Math.max(0, Math.min(100, toNum(t.pos_x) as number))
                  const py = Math.max(0, Math.min(100, toNum(t.pos_y) as number))
                  const isReserved = (reserved || []).includes(t.table_number)
                  const isSelected = selected.includes(t.table_number)
                  const reservedBorder = (t as any).kind === 'vip' ? 'border-yellow-500' : (t as any).kind === 'haute' ? 'border-indigo-500' : 'border-foreground'
                  const base = isReserved
                    ? `bg-red-600 text-white ${reservedBorder} border-2 opacity-70 cursor-not-allowed`
                    : pillClass((t as any).kind, isSelected)
                  return (
                    <div key={t.id} className="absolute" style={{ left: `${px}%`, top: `${py}%`, transform: 'translate(-50%, -50%)' }}>
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => { if (!isReserved) toggle(t.table_number) }}
                          aria-disabled={isReserved}
                          className={`rounded-full shrink-0 p-0 overflow-hidden whitespace-nowrap text-[10px] md:text-sm leading-none font-medium border transition-colors inline-flex items-center justify-center self-center justify-self-center appearance-none select-none font-mono tracking-tight ${base}`}
                          style={{ borderRadius: '9999px', width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', maxWidth: '24px', maxHeight: '24px' }}
                        >
                          {t.table_number}
                        </button>
                        {isReserved && reservedInfo?.[t.table_number] && (
                          <div className="pointer-events-none hidden md:group-hover:block absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-50 whitespace-nowrap rounded bg-black/90 text-white text-xs py-1 px-2 shadow-md">
                            {reservedInfo[t.table_number].name} • {reservedInfo[t.table_number].guests} pers.
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Fallback grid for unpositioned tables */}
              {unpositioned.length > 0 && (
                <div className="absolute inset-0 z-20 grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 p-2 sm:p-4 place-items-center content-start">
                  {unpositioned.map((t: any) => {
                    const isReserved = (reserved || []).includes(t.table_number)
                    const isSelected = selected.includes(t.table_number)
                    const reservedBorder = (t as any).kind === 'vip' ? 'border-yellow-500' : (t as any).kind === 'haute' ? 'border-indigo-500' : 'border-foreground'
                    const base = isReserved
                      ? `bg-red-600 text-white ${reservedBorder} border-2 opacity-70 cursor-not-allowed`
                      : pillClass((t as any).kind, isSelected)
                    return (
                      <div key={t.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => { if (!isReserved) toggle(t.table_number) }}
                          aria-disabled={isReserved}
                          className={`rounded-full shrink-0 p-0 overflow-hidden whitespace-nowrap text-[10px] md:text-sm leading-none font-medium border transition-colors inline-flex items-center justify-center appearance-none select-none font-mono tracking-tight box-content ${base}`}
                          style={{ borderRadius: '9999px', width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', maxWidth: '24px', maxHeight: '24px' }}
                        >
                          {t.table_number}
                        </button>
                        {isReserved && reservedInfo?.[t.table_number] && (
                          <div className="pointer-events-none hidden md:group-hover:block absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-50 whitespace-nowrap rounded bg-black/90 text-white text-xs py-1 px-2 shadow-md">
                            {reservedInfo[t.table_number].name} • {reservedInfo[t.table_number].guests} pers.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )
        })()}
      </div>
      <div className="text-sm text-muted-foreground">Tables libres: {(tables?.length || 0) - (reserved?.length || 0)}</div>
    </div>
  )
}

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'guestlist'>('reservations')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [venueFilter, setVenueFilter] = useState<'all' | 'Melkior' | "Bal'tazar">('all')
  const [kindFilter, setKindFilter] = useState<'all' | 'assises' | 'haute' | 'vip'>('all')
  const [depositFilter, setDepositFilter] = useState<'all' | 'with' | 'without'>('all')
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    loadReservations()
  }, [selectedDate, venueFilter])

  useEffect(() => {
    loadProfile()
  }, [])

  // Charger les types de tables pour afficher les icônes par numéro
  const [tableKinds, setTableKinds] = useState<Record<string, 'assises' | 'haute' | 'vip'>>({})
  useEffect(() => {
    loadTableKinds()
  }, [])

  const filteredReservations = useMemo(() => {
    let list = reservations || []
    if (kindFilter !== 'all') {
      list = list.filter((r) => {
        const tables = r?.reservation_tables || []
        return tables.some((rt: any) => tableKinds[`${r.venue}:${rt.table_number}`] === kindFilter)
      })
    }
    if (depositFilter === 'with') {
      list = list.filter((r: any) => (r?.deposit_cents || 0) > 0)
    } else if (depositFilter === 'without') {
      list = list.filter((r: any) => !r?.deposit_cents || r.deposit_cents === 0)
    }
    const statusOrder: Record<string, number> = { en_attente: 0, arrive: 1, servi: 2 }
    list = [...list].sort((a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0))
    return list
  }, [reservations, kindFilter, tableKinds, depositFilter])

  const loadTableKinds = async () => {
    try {
      const res = await fetch('/api/admin/tables/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur API')
      const rows = result.tables || []
      const map: Record<string, 'assises' | 'haute' | 'vip'> = {}
      rows.forEach((t: any) => {
        map[`${t.venue}:${t.table_number}`] = t.kind
      })
      setTableKinds(map)
    } catch (e) {
      console.error('Erreur chargement types de tables:', e)
    }
  }

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Erreur chargement profil:', error)
        // Supprimer le toast d'erreur pour éviter les notifications répétées
      } else {
        console.log('Profil chargé:', data)
        setProfile(data)
      }
    }
  }

  const loadReservations = async () => {
    setLoading(true)
    let query = supabase
      .from('reservations')
      .select(`
        *,
        reservation_tables (table_number),
        reservation_consumptions (id, consumption_type_id, quantity, consumption_type:consumption_types(id, name, sort_order))
      `)
      .eq('date', selectedDate)
      .order('created_at', { ascending: false })

    if (venueFilter !== 'all') {
      query = query.eq('venue', venueFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur chargement réservations:', error)
      toast.error('Erreur de chargement', { description: error.message })
      setLoading(false)
      return
    }

    const rows = data || []

    // Charger les profils séparément et les fusionner
    const userIds = Array.from(new Set([
      ...rows.map((r: any) => r.created_by).filter(Boolean),
      ...rows.map((r: any) => r.served_by).filter(Boolean),
    ]))

    let profilesMap: Record<string, { username: string; role: string }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, role')
        .in('id', userIds)
      if (profiles) {
        profiles.forEach((p: any) => { profilesMap[p.id] = p })
      }
    }

    const enriched = rows.map((r: any) => ({
      ...r,
      created_by_profile: r.created_by ? profilesMap[r.created_by] ?? null : null,
      served_by_profile: r.served_by ? profilesMap[r.served_by] ?? null : null,
    }))

    setReservations(enriched)
    setLoading(false)
  }

  const cycleStatus = async (reservation: Reservation) => {
    const next = reservation.status === 'en_attente' ? 'arrive' : reservation.status === 'arrive' ? 'servi' : 'en_attente'
    const update: Record<string, any> = { status: next }
    if (next === 'servi' && profile?.id) {
      update.served_by = profile.id
    } else if (next !== 'servi') {
      update.served_by = null
    }
    const { error } = await supabase
      .from('reservations')
      .update(update)
      .eq('id', reservation.id)

    if (error) {
      toast.error('Erreur de mise à jour', { description: error.message })
    } else {
      toast.success('Statut mis à jour')
      loadReservations()
    }
  }

  const openDeleteDialog = (reservation: Reservation) => {
    setDeletingReservation(reservation)
    setShowDeleteDialog(true)
  }

  const confirmDeleteReservation = async () => {
    if (!deletingReservation) return

    try {
      // Supprimer d'abord les tables liées
      const { error: tablesError } = await supabase
        .from('reservation_tables')
        .delete()
        .eq('reservation_id', deletingReservation.id)

      if (tablesError) {
        console.error('Erreur suppression tables:', tablesError)
      }

      // Puis supprimer la réservation
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', deletingReservation.id)

      if (error) {
        console.error('Erreur suppression réservation:', error)
        toast.error('Erreur de suppression', { description: error.message })
      } else {
        toast.success('Réservation supprimée')
        loadReservations()
        setShowDeleteDialog(false)
        setDeletingReservation(null)
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error('Erreur de suppression', { description: error.message })
    }
  }

  const openEditDialog = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setShowEditDialog(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'server': return 'default'
      case 'porter': return 'secondary'
      default: return 'outline'
    }
  }

  const getVenueRowClass = (venue: string, status: string) => {
    const statusClass = status === 'servi' ? 'opacity-40 outline outline-1 outline-green-500' : status === 'arrive' ? 'outline outline-1 outline-red-500' : ''
    if (venue === "Bal'tazar") {
      return `${statusClass} bg-red-900/10 hover:bg-red-900/20`
    }
    return statusClass
  }

  const getVenueCardClass = (venue: string, status: string) => {
    if (status === 'servi') {
      const base = venue === "Bal'tazar" ? 'bg-red-900/10' : ''
      return `opacity-40 border-green-500 border-2 ${base}`
    }
    if (status === 'arrive') {
      const base = venue === "Bal'tazar" ? 'bg-red-900/10' : ''
      return `border-red-500 border-2 ${base}`
    }
    if (venue === "Bal'tazar") {
      return 'bg-red-900/10 border-red-900/20'
    }
    return ''
  }

  const statusLabel = (status: string) => {
    if (status === 'arrive') return 'Arrivé'
    if (status === 'servi') return 'Servi'
    return 'En attente'
  }

  const statusVariant = (status: string): 'default' | 'outline' | 'secondary' => {
    if (status === 'arrive') return 'default'
    if (status === 'servi') return 'secondary'
    return 'outline'
  }

  

  return (
    <div className="container mx-auto p-6 pb-24 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          {new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour'} {profile?.username || ''}
        </h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reservations' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Réservations
        </button>
        <button
          onClick={() => setActiveTab('guestlist')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'guestlist' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListChecks className="h-4 w-4" />
          Guestlist
        </button>
      </div>

      {activeTab === 'guestlist' && (
        <GuestlistTab selectedDate={selectedDate} onDateChange={setSelectedDate} />
      )}

      {activeTab === 'reservations' && (
      <>
      <div className="hidden md:block">
        <Button className="w-full h-12" onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      <div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle réservation</DialogTitle>
            </DialogHeader>
            <NewReservationForm 
              onSuccess={() => {
                setShowNewDialog(false)
                loadReservations()
              }}
              defaultDate={selectedDate}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de modification */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la réservation</DialogTitle>
            </DialogHeader>
            {editingReservation && (
              <EditReservationForm 
                reservation={editingReservation}
                onSuccess={() => {
                  setShowEditDialog(false)
                  setEditingReservation(null)
                  loadReservations()
                }}
                onCancel={() => {
                  setShowEditDialog(false)
                  setEditingReservation(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmer la suppression
              </DialogTitle>
            </DialogHeader>
            {deletingReservation && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium">{deletingReservation.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {deletingReservation.venue} • {deletingReservation.guests} personnes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(deletingReservation.date), 'EEE dd MMMM', { locale: fr })}
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setDeletingReservation(null)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDeleteReservation}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer définitivement
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Sticky action bar on mobile */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-screen-md px-4 py-3">
          <Button className="w-full h-12" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle réservation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sélection de date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Date des réservations</label>
              <div className="relative w-full min-w-0 overflow-visible">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full min-w-0 pr-10 appearance-none text-base min-h-[44px]"
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Salle</label>
              <Select value={venueFilter} onValueChange={(v: any) => setVenueFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Melkior">Melkior</SelectItem>
                  <SelectItem value="Bal'tazar">Bal'tazar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Type de table</label>
              <Select value={kindFilter} onValueChange={(v: any) => setKindFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="assises">Assises</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Acompte</label>
              <Select value={depositFilter} onValueChange={(v: any) => setDepositFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="with">Avec acompte</SelectItem>
                  <SelectItem value="without">Sans acompte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="leading-tight">
              <div>Réservations du</div>
              <div className="mt-1 text-xl font-semibold inline-flex items-center">
                {format(new Date(selectedDate), 'EEE dd MMMM', { locale: fr })}
                <Badge variant="outline" className="ml-2">
                  {filteredReservations.length} réservation{filteredReservations.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune réservation trouvée
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vue desktop - tableau */}
              <div className="hidden md:block">
                <TableUI>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Tables</TableHead>
                      <TableHead>Personnes</TableHead>
                      <TableHead>Acompte</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Servi par</TableHead>
                      <TableHead>Consommations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow 
                        key={reservation.id}
                        className={getVenueRowClass(reservation.venue, reservation.status)}
                      >
                        <TableCell className="font-medium">{reservation.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="inline-flex items-center gap-1">
                            {renderVenueLogo(reservation.venue, 22)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {reservation.reservation_tables?.map((rt, idx) => {
                              const kind = tableKinds[`${reservation.venue}:${rt.table_number}`]
                              return (
                                <span key={`${reservation.id}-${rt.table_number}-${idx}`} className="inline-flex items-center gap-1">
                                  {renderKindIcon(kind)}
                                  <span className="text-base font-semibold leading-none">{rt.table_number}</span>
                                </span>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {reservation.guests}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Euro className="h-3 w-3 mr-1" />
                            {formatEuro(reservation.deposit_cents)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={statusVariant(reservation.status)}
                            size="sm"
                            onClick={() => cycleStatus(reservation)}
                          >
                            {statusLabel(reservation.status)}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {reservation.served_by_profile ? (
                            <span className="text-xs text-muted-foreground">{reservation.served_by_profile.username}</span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {reservation.reservation_consumptions && reservation.reservation_consumptions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {reservation.reservation_consumptions.map((c, i) => (
                                <Badge key={i} variant="secondary" className="text-xs whitespace-nowrap">
                                  {c.quantity}x {(c as any).consumption_type?.name ?? `#${c.consumption_type_id}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(reservation)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDeleteDialog(reservation)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableUI>
              </div>

              {/* Vue mobile - cartes */}
              <div className="md:hidden space-y-3">
                {filteredReservations.map((reservation) => (
                  <Card key={reservation.id} className={getVenueCardClass(reservation.venue, reservation.status)}>
                    <CardContent className="p-4">
                      {/* Ligne 1 : logo + nom en majuscule */}
                      <div className="flex items-center gap-2 min-w-0 mb-1">
                        {renderVenueLogo(reservation.venue, 20)}
                        <h3 className="font-bold text-base uppercase tracking-wide truncate">{reservation.name}</h3>
                      </div>
                      {/* Ligne 2 : statut */}
                      <div className="flex justify-center mb-2">
                        <Button
                          variant={statusVariant(reservation.status)}
                          size="sm"
                          onClick={() => cycleStatus(reservation)}
                        >
                          {statusLabel(reservation.status)}
                        </Button>
                      </div>

                      {/* Ligne 2 : tables */}
                      <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                        {reservation.reservation_tables && reservation.reservation_tables.length > 0 ? (
                          reservation.reservation_tables.map((rt, idx) => {
                            const kind = tableKinds[`${reservation.venue}:${rt.table_number}`]
                            return (
                              <span key={`${reservation.id}-m-${rt.table_number}-${idx}`} className="inline-flex items-center gap-0.5 text-muted-foreground">
                                {renderKindIcon(kind, 'md')}
                                <span className="font-bold text-foreground text-base">{rt.table_number}</span>
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucune table</span>
                        )}
                      </div>

                      {/* Informations détaillées */}
                      <div className="flex justify-center gap-6 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{reservation.guests} pers.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Euro className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formatEuro(reservation.deposit_cents)}</span>
                        </div>
                      </div>
                      {reservation.reservation_consumptions && reservation.reservation_consumptions.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mb-3">
                          {reservation.reservation_consumptions.map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {c.quantity}x {(c as any).consumption_type?.name ?? `#${c.consumption_type_id}`}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(reservation)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDeleteDialog(reservation)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {reservation.status === 'servi' && reservation.served_by_profile && (
                        <div className="flex justify-center items-center gap-1 mt-3 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Servi par <span className="font-medium text-foreground">{reservation.served_by_profile.username}</span></span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Total guests footer */}
              <div className="pt-3 mt-2 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total personnes</span>
                <span className="font-semibold">
                  {filteredReservations.reduce((sum: number, r: any) => sum + (r?.guests || 0), 0)} pers.
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total acomptes</span>
                <span className="font-semibold">
                  {formatEuro(filteredReservations.reduce((sum: number, r: any) => sum + (r?.deposit_cents || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}
    </div>
  )
}

interface GuestlistEntry {
  id: number
  name: string
  date: string
  guests: number
  notes: string | null
  venue: string
  status: 'en_attente' | 'arrive'
  created_at: string
}

function GuestlistTab({ selectedDate, onDateChange }: { selectedDate: string; onDateChange: (d: string) => void }) {
  const [entries, setEntries] = useState<GuestlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<GuestlistEntry | null>(null)
  const [deleting, setDeleting] = useState<GuestlistEntry | null>(null)

  useEffect(() => { load() }, [selectedDate])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('guestlist')
      .select('*')
      .eq('date', selectedDate)
      .order('created_at', { ascending: false })
    if (error) toast.error('Erreur de chargement', { description: error.message })
    else setEntries(data || [])
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleting) return
    const { error } = await supabase.from('guestlist').delete().eq('id', deleting.id)
    if (error) toast.error('Erreur de suppression', { description: error.message })
    else { toast.success('Entrée supprimée'); setDeleting(null); load() }
  }

  const toggleStatus = async (entry: GuestlistEntry) => {
    const next = entry.status === 'en_attente' ? 'arrive' : 'en_attente'
    const { error } = await supabase.from('guestlist').update({ status: next }).eq('id', entry.id)
    if (error) toast.error('Erreur', { description: error.message })
    else load()
  }

  const total = entries.reduce((sum, e) => sum + e.guests, 0)

  return (
    <div className="space-y-4">
      {/* Sélecteur de date */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Date</label>
              <div className="relative w-full">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full pr-10 appearance-none text-base min-h-[44px]"
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            <span>Guestlist du {format(new Date(selectedDate), 'EEE dd MMMM', { locale: fr })}</span>
            <Badge variant="outline">{entries.length} entrée{entries.length !== 1 ? 's' : ''}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune entrée pour cette date</div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className={`flex flex-col px-3 py-3 rounded-md border gap-2 ${entry.status === 'arrive' ? 'border-green-500 border-2 opacity-60' : 'bg-card'}`}>
                  {/* Ligne 1 : nom + badge */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="font-bold uppercase tracking-wide truncate text-base">{entry.name}</span>
                    <Badge variant="secondary" className="shrink-0">
                      <Users className="h-3 w-3 mr-1" />
                      {entry.guests} pers.
                    </Badge>
                  </div>
                  {entry.notes && <p className="text-xs text-muted-foreground truncate">{entry.notes}</p>}
                  {/* Ligne 2 : actions centrées */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant={entry.status === 'arrive' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => toggleStatus(entry)}
                    >
                      {entry.status === 'arrive' ? 'Arrivé' : 'En attente'}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditing(entry)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDeleting(entry)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-1 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total personnes</span>
                <span className="font-semibold">{total} pers.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog ajout / édition */}
      <Dialog open={showAdd || !!editing} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditing(null) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier l\'entrée' : 'Nouvelle entrée guestlist'}</DialogTitle>
          </DialogHeader>
          <GuestlistForm
            initial={editing}
            defaultDate={selectedDate}
            onSuccess={() => { setShowAdd(false); setEditing(null); load() }}
            onCancel={() => { setShowAdd(false); setEditing(null) }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <Dialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Supprimer <span className="font-semibold text-foreground">{deleting?.name}</span> de la guestlist ?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GuestlistForm({
  initial, defaultDate, onSuccess, onCancel
}: {
  initial: GuestlistEntry | null
  defaultDate: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [date, setDate] = useState(initial?.date ?? defaultDate)
  const [guests, setGuests] = useState(initial?.guests ?? 1)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      if (initial) {
        const { error } = await supabase.from('guestlist').update({ name: name.trim(), date, guests, notes: notes.trim() || null }).eq('id', initial.id)
        if (error) throw error
        toast.success('Entrée modifiée')
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('guestlist').insert({ name: name.trim(), date, guests, notes: notes.trim() || null, created_by: user?.id })
        if (error) throw error
        toast.success('Entrée ajoutée')
      }
      onSuccess()
    } catch (e: any) {
      toast.error('Erreur', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Nom</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la personne" className="mt-1" autoFocus />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>Nombre de personnes</Label>
        <Input type="number" min={1} value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} className="mt-1" />
      </div>
      <div>
        <Label>Notes <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="VIP, table réservée..." className="mt-1" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Enregistrement...' : (initial ? 'Modifier' : 'Ajouter')}</Button>
      </div>
    </div>
  )
}

function EditReservationForm({ 
  reservation, 
  onSuccess, 
  onCancel 
}: { 
  reservation: Reservation
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    venue: reservation.venue,
    date: reservation.date,
    name: reservation.name,
    guests: reservation.guests.toString(),
    deposit: reservation.deposit_cents ? (reservation.deposit_cents / 100).toString() : '',
    phone: reservation.phone || '',
    notes: reservation.notes || '',
    tables: [] as number[]
  })
  const [consumptions, setConsumptions] = useState<{ consumption_type_id: number; quantity: number }[]>(
    (reservation.reservation_consumptions || []).map(c => ({ consumption_type_id: c.consumption_type_id, quantity: c.quantity }))
  )
  const [consumptionTypes, setConsumptionTypes] = useState<ConsumptionType[]>([])
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [allTables, setAllTables] = useState<Table[]>([])
  const [reservedNumbers, setReservedNumbers] = useState<number[]>([])
  const [reservedInfo, setReservedInfo] = useState<Record<number, { name: string, guests: number }>>({})
  const [loading, setLoading] = useState(false)
  const [showTablePicker, setShowTablePicker] = useState(false)

  useEffect(() => {
    loadAvailableTables()
    loadCurrentTables()
  }, [formData.venue, formData.date])

  useEffect(() => {
    supabase.from('consumption_types').select('*').order('sort_order').then(({ data }) => {
      if (data) setConsumptionTypes(data)
    })
  }, [])

  const loadCurrentTables = async () => {
    const { data } = await supabase
      .from('reservation_tables')
      .select('table_number')
      .eq('reservation_id', reservation.id)
    
    if (data) {
      setFormData(prev => ({ ...prev, tables: data.map(rt => rt.table_number) }))
    }
  }

  const loadAvailableTables = async () => {
    const { data: allTablesData } = await supabase
      .from('tables')
      .select('*')
      .eq('venue', formData.venue)
      .order('table_number')

    const { data: reservedTables } = await supabase
      .from('reservation_tables')
      .select('table_number, reservations(name, guests)')
      .eq('venue', formData.venue)
      .eq('date', formData.date)
      .neq('reservation_id', reservation.id) // Exclure les tables de cette réservation

    const resNums = reservedTables?.map(rt => rt.table_number) || []
    const available = (allTablesData || []).filter(table => !resNums.includes(table.table_number)) || []
    setAllTables(allTablesData || [])
    setReservedNumbers(resNums)
    setAvailableTables(available)
    const info: Record<number, { name: string, guests: number }> = {}
    ;(reservedTables || []).forEach((rt: any) => {
      const r = rt.reservations
      if (r && typeof rt.table_number === 'number') info[rt.table_number] = { name: r.name, guests: r.guests }
    })
    setReservedInfo(info)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mettre à jour la réservation
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          venue: formData.venue,
          date: formData.date,
          name: formData.name,
          guests: parseInt(formData.guests),
          deposit_cents: formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null,
          phone: formData.phone || null,
          notes: formData.notes || null,
        })
        .eq('id', reservation.id)

      if (reservationError) throw reservationError

      // Supprimer les anciennes tables
      await supabase
        .from('reservation_tables')
        .delete()
        .eq('reservation_id', reservation.id)

      // Ajouter les nouvelles tables
      if (formData.tables.length > 0) {
        const tableInserts = formData.tables.map(tableNumber => ({
          reservation_id: reservation.id,
          venue: formData.venue,
          table_number: tableNumber,
          date: formData.date
        }))

        const { error: tablesError } = await supabase
          .from('reservation_tables')
          .insert(tableInserts)

        if (tablesError) throw tablesError
      }

      // Mettre à jour les consommations : supprimer les anciennes, insérer les nouvelles
      await supabase.from('reservation_consumptions').delete().eq('reservation_id', reservation.id)
      if (consumptions.length > 0) {
        const consumptionInserts = consumptions.map(c => ({
          reservation_id: reservation.id,
          consumption_type_id: c.consumption_type_id,
          quantity: c.quantity
        }))
        const { error: consumptionsError } = await supabase
          .from('reservation_consumptions')
          .insert(consumptionInserts)
        if (consumptionsError) throw consumptionsError
      }

      toast.success('Réservation modifiée avec succès')
      onSuccess()
    } catch (error: any) {
      toast.error('Erreur de modification', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Salle</label>
          <Select value={formData.venue} onValueChange={(value: any) => setFormData({...formData, venue: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Melkior">Melkior</SelectItem>
              <SelectItem value="Bal'tazar">Bal'tazar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
            className="w-full min-w-0 text-base min-h-[44px]"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Nom du client</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="text-base min-h-[44px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre de personnes</label>
          <Input
            type="number"
            min="1"
            value={formData.guests}
            onChange={(e) => setFormData({...formData, guests: e.target.value})}
            required
            className="text-base min-h-[44px]"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Acompte (€)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.deposit}
            onChange={(e) => setFormData({...formData, deposit: e.target.value})}
            className="text-base min-h-[44px]"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Téléphone</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="text-base min-h-[44px]"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Notes</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Notes sur la réservation..."
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Sélection des tables</label>
        <div className="flex gap-2 items-center">
          <Button type="button" variant="outline" onClick={() => setShowTablePicker(true)}>
            Choisir la table
          </Button>
          <span className="text-sm text-muted-foreground">
            {formData.tables.length > 0 ? `Tables: ${formData.tables.sort((a,b)=>a-b).join(', ')}` : 'Aucune sélection'}
          </span>
        </div>
        <Dialog open={showTablePicker} onOpenChange={setShowTablePicker}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Choisir la table – {formData.venue}</DialogTitle>
            </DialogHeader>
            <TablePlanPicker
              venue={formData.venue}
              tables={allTables}
              reserved={reservedNumbers}
              reservedInfo={reservedInfo}
              selected={formData.tables}
              onChange={(tables) => setFormData({ ...formData, tables })}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Consommations prévues</label>
        <ConsumptionPicker
          consumptionTypes={consumptionTypes}
          value={consumptions}
          onChange={setConsumptions}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Modification...' : 'Modifier la réservation'}
        </Button>
      </div>
    </form>
  )
}

function NewReservationForm({ onSuccess, defaultDate }: { onSuccess: () => void, defaultDate: string }) {
  const [formData, setFormData] = useState({
    venue: 'Melkior' as 'Melkior' | 'Bal\'tazar',
    date: defaultDate,
    name: '',
    guests: '',
    deposit: '',
    phone: '',
    notes: '',
    tables: [] as number[]
  })
  const [consumptions, setConsumptions] = useState<{ consumption_type_id: number; quantity: number }[]>([])
  const [consumptionTypes, setConsumptionTypes] = useState<ConsumptionType[]>([])
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [allTables, setAllTables] = useState<Table[]>([])
  const [reservedNumbers, setReservedNumbers] = useState<number[]>([])
  const [reservedInfo, setReservedInfo] = useState<Record<number, { name: string, guests: number }>>({})
  const [loading, setLoading] = useState(false)
  const [showTablePicker, setShowTablePicker] = useState(false)

  useEffect(() => {
    loadAvailableTables()
  }, [formData.venue, formData.date])

  useEffect(() => {
    supabase.from('consumption_types').select('*').order('sort_order').then(({ data }) => {
      if (data) setConsumptionTypes(data)
    })
  }, [])

  const loadAvailableTables = async () => {
    // Charger toutes les tables de la salle
    const { data: allTablesData } = await supabase
      .from('tables')
      .select('*')
      .eq('venue', formData.venue)
      .order('table_number')

    // Charger les tables déjà réservées
    const { data: reservedTables } = await supabase
      .from('reservation_tables')
      .select('table_number, reservations(name, guests)')
      .eq('venue', formData.venue)
      .eq('date', formData.date)

    const resNums = reservedTables?.map(rt => rt.table_number) || []
    const available = (allTablesData || []).filter(table => !resNums.includes(table.table_number)) || []
    setAllTables(allTablesData || [])
    setReservedNumbers(resNums)
    setAvailableTables(available)
    const info: Record<number, { name: string, guests: number }> = {}
    ;(reservedTables || []).forEach((rt: any) => {
      const r = rt.reservations
      if (r && typeof rt.table_number === 'number') info[rt.table_number] = { name: r.name, guests: r.guests }
    })
    setReservedInfo(info)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Créer la réservation
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          venue: formData.venue,
          date: formData.date,
          name: formData.name,
          guests: parseInt(formData.guests),
          deposit_cents: formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null,
          phone: formData.phone || null,
          notes: formData.notes || null,
          created_by: user.id
        })
        .select()
        .single()

      if (reservationError) throw reservationError

      // Ajouter les tables
      if (formData.tables.length > 0) {
        const tableInserts = formData.tables.map(tableNumber => ({
          reservation_id: reservation.id,
          table_number: tableNumber
        }))

        const { error: tablesError } = await supabase
          .from('reservation_tables')
          .insert(tableInserts)

        if (tablesError) throw tablesError
      }

      // Ajouter les consommations
      if (consumptions.length > 0) {
        const consumptionInserts = consumptions.map(c => ({
          reservation_id: reservation.id,
          consumption_type_id: c.consumption_type_id,
          quantity: c.quantity
        }))
        const { error: consumptionsError } = await supabase
          .from('reservation_consumptions')
          .insert(consumptionInserts)
        if (consumptionsError) throw consumptionsError
      }

      toast.success('Réservation créée avec succès')
      onSuccess()
    } catch (error: any) {
      toast.error('Erreur de création', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Salle</label>
          <Select value={formData.venue} onValueChange={(value: any) => setFormData({...formData, venue: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Melkior">Melkior</SelectItem>
              <SelectItem value="Bal'tazar">Bal'tazar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
            className="w-full min-w-0"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Nom du client</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre de personnes</label>
          <Input
            type="number"
            min="1"
            value={formData.guests}
            onChange={(e) => setFormData({...formData, guests: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Acompte (€)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.deposit}
            onChange={(e) => setFormData({...formData, deposit: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Téléphone</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Notes</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Notes sur la réservation..."
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Sélection des tables</label>
        <div className="flex gap-2 items-center">
          <Button type="button" variant="outline" onClick={() => setShowTablePicker(true)}>
            Choisir la table
          </Button>
          <span className="text-sm text-muted-foreground">
            {formData.tables.length > 0 ? `Tables: ${formData.tables.sort((a,b)=>a-b).join(', ')}` : 'Aucune sélection'}
          </span>
        </div>
        <Dialog open={showTablePicker} onOpenChange={setShowTablePicker}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Choisir la table – {formData.venue}</DialogTitle>
            </DialogHeader>
            <TablePlanPicker
              venue={formData.venue}
              tables={allTables}
              reserved={reservedNumbers}
              reservedInfo={reservedInfo}
              selected={formData.tables}
              onChange={(tables) => setFormData({ ...formData, tables })}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Consommations prévues</label>
        <ConsumptionPicker
          consumptionTypes={consumptionTypes}
          value={consumptions}
          onChange={setConsumptions}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer la réservation'}
        </Button>
      </div>
    </form>
  )
}
