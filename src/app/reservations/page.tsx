'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, type Reservation, type Profile, type Table, canManageReservations } from '@/lib/supabase'
import { formatEuro } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Euro, AlertTriangle, Crown, Armchair, Wine } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'

// Helper icon renderer visible to all components in this module
function renderKindIcon(kind?: 'assises' | 'haute' | 'vip') {
  switch (kind) {
    case 'vip':
      return <Crown className="h-3 w-3 text-yellow-500" />
    case 'assises':
      return <Armchair className="h-3 w-3 text-muted-foreground" />
    case 'haute':
      return <Wine className="h-3 w-3 text-indigo-500" />
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
        created_by_profile:profiles!created_by (username, role),
        reservation_tables (table_number)
      `)
      .eq('date', selectedDate)
      .order('arrived', { ascending: true })
      .order('created_at', { ascending: false })

    if (venueFilter !== 'all') {
      query = query.eq('venue', venueFilter)
    }


    const { data, error } = await query

    if (error) {
      console.error('Erreur chargement réservations:', error)
      toast.error('Erreur de chargement', { description: error.message })
    } else {
      console.log('Réservations chargées:', data)
      setReservations(data || [])
    }
    setLoading(false)
  }

  const toggleArrived = async (reservation: Reservation) => {
    const { error } = await supabase
      .from('reservations')
      .update({ arrived: !reservation.arrived })
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

  const getVenueRowClass = (venue: string, arrived: boolean) => {
    const baseClass = arrived ? 'opacity-40' : ''
    if (venue === "Bal'tazar") {
      return `${baseClass} bg-red-900/10 hover:bg-red-900/20`
    }
    return baseClass
  }

  const getVenueCardClass = (venue: string, arrived: boolean) => {
    const baseClass = arrived ? 'opacity-40' : ''
    if (venue === "Bal'tazar") {
      return `${baseClass} bg-red-900/10 border-red-900/20`
    }
    return baseClass
  }

  

  return (
    <div className="container mx-auto p-6 pb-24 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          {new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour'} {profile?.username || ''}
        </h1>
      </div>

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
                      <TableHead>Arrivé</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow 
                        key={reservation.id}
                        className={getVenueRowClass(reservation.venue, reservation.arrived)}
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
                            variant={reservation.arrived ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleArrived(reservation)}
                          >
                            {reservation.arrived ? 'Arrivé' : 'En attente'}
                          </Button>
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
                  <Card key={reservation.id} className={getVenueCardClass(reservation.venue, reservation.arrived)}>
                    <CardContent className="p-4">
                      {/* En-tête avec nom et statut */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{reservation.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
                              {renderVenueLogo(reservation.venue, 18)}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex flex-wrap gap-2">
                              Tables:
                              {reservation.reservation_tables && reservation.reservation_tables.length > 0 ? (
                                reservation.reservation_tables.map((rt, idx) => {
                                  const kind = tableKinds[`${reservation.venue}:${rt.table_number}`]
                                  return (
                                    <span key={`${reservation.id}-m-${rt.table_number}-${idx}`} className="inline-flex items-center gap-1">
                                      {renderKindIcon(kind)}
                                      <span className="text-base font-bold leading-none">{rt.table_number}</span>
                                    </span>
                                  )
                                })
                              ) : (
                                <span className="ml-1">Aucune</span>
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant={reservation.arrived ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleArrived(reservation)}
                          className="ml-3 shrink-0"
                        >
                          {reservation.arrived ? 'Arrivé' : 'En attente'}
                        </Button>
                      </div>
                      
                      {/* Informations détaillées */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{reservation.guests} pers.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formatEuro(reservation.deposit_cents)}</span>
                        </div>
                      </div>
                      
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(reservation)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(reservation)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
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
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [allTables, setAllTables] = useState<Table[]>([])
  const [reservedNumbers, setReservedNumbers] = useState<number[]>([])
  const [reservedInfo, setReservedInfo] = useState<Record<number, { name: string, guests: number }>>({})
  const [loading, setLoading] = useState(false)
  const [showTablePicker, setShowTablePicker] = useState(false)

  useEffect(() => {
    loadAvailableTables()
  }, [formData.venue, formData.date])

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

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer la réservation'}
        </Button>
      </div>
    </form>
  )
}
