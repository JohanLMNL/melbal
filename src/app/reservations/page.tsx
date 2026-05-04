'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, type Reservation } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTableKinds } from '@/lib/hooks/useTableKinds'
import { formatEuro } from '@/lib/utils'
import { renderKindIcon, renderVenueLogo, statusLabel, statusVariant, getVenueRowClass, getVenueCardClass } from '@/components/reservations/helpers'
import { GuestlistTab } from '@/components/reservations/GuestlistTab'
import { ShotgunTab } from '@/components/reservations/ShotgunTab'
import { PlanTab } from '@/components/reservations/PlanTab'
import { NewReservationForm } from '@/components/reservations/NewReservationForm'
import { EditReservationForm } from '@/components/reservations/EditReservationForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Euro, AlertTriangle, ListChecks, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ReservationsPage() {
  const { profile } = useAuth()
  const tableKinds = useTableKinds()

  const [activeTab, setActiveTab] = useState<'reservations' | 'guestlist' | 'plan' | 'shotgun'>('reservations')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [venueFilter, setVenueFilter] = useState<'all' | 'Melkior' | "Bal'tazar">('all')
  const [kindFilter, setKindFilter] = useState<'all' | 'assises' | 'haute' | 'vip'>('all')
  const [depositFilter, setDepositFilter] = useState<'all' | 'with' | 'without'>('all')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null)

  useEffect(() => { loadReservations() }, [selectedDate, venueFilter])

  const filteredReservations = useMemo(() => {
    let list = reservations || []
    if (kindFilter !== 'all') {
      list = list.filter((r) => {
        const tables = r?.reservation_tables || []
        return tables.some((rt: any) => tableKinds[`${r.venue}:${rt.table_number}`] === kindFilter)
      })
    }
    if (depositFilter === 'with') list = list.filter((r: any) => (r?.deposit_cents || 0) > 0)
    else if (depositFilter === 'without') list = list.filter((r: any) => !r?.deposit_cents || r.deposit_cents === 0)
    const statusOrder: Record<string, number> = { en_attente: 0, arrive: 1, servi: 2 }
    return [...list].sort((a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0))
  }, [reservations, kindFilter, tableKinds, depositFilter])

  const loadReservations = async () => {
    setLoading(true)
    let query = supabase
      .from('reservations')
      .select('*, reservation_tables (table_number), reservation_consumptions (id, consumption_type_id, quantity, consumption_type:consumption_types(id, name, sort_order))')
      .eq('date', selectedDate)
      .order('created_at', { ascending: false })
    if (venueFilter !== 'all') query = query.eq('venue', venueFilter)

    const { data, error } = await query
    if (error) {
      toast.error('Erreur de chargement', { description: error.message })
      setLoading(false)
      return
    }
    const rows = data || []

    // Charger les profils en parallèle (une seule requête groupée)
    const userIds = Array.from(new Set([
      ...rows.map((r: any) => r.created_by).filter(Boolean),
      ...rows.map((r: any) => r.served_by).filter(Boolean),
    ]))
    let profilesMap: Record<string, { username: string; role: string }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, username, role').in('id', userIds)
      profiles?.forEach((p: any) => { profilesMap[p.id] = p })
    }

    setReservations(rows.map((r: any) => ({
      ...r,
      created_by_profile: r.created_by ? profilesMap[r.created_by] ?? null : null,
      served_by_profile: r.served_by ? profilesMap[r.served_by] ?? null : null,
    })))
    setLoading(false)
  }

  // Optimistic cycleStatus
  const cycleStatus = async (reservation: Reservation) => {
    const next = reservation.status === 'en_attente' ? 'arrive' : reservation.status === 'arrive' ? 'servi' : 'en_attente'
    const update: Record<string, any> = { status: next }
    if (next === 'servi' && profile?.id) update.served_by = profile.id
    else if (next !== 'servi') update.served_by = null

    // Optimistic update
    setReservations(prev => prev.map(r => r.id === reservation.id ? {
      ...r, status: next,
      served_by: update.served_by ?? r.served_by,
      served_by_profile: next === 'servi' && profile ? { username: profile.username, role: profile.role } : null
    } as any : r))

    const { error } = await supabase.from('reservations').update(update).eq('id', reservation.id)
    if (error) {
      toast.error('Erreur de mise à jour', { description: error.message })
      loadReservations() // rollback
    } else {
      toast.success('Statut mis à jour')
    }
  }

  // Optimistic delete
  const confirmDeleteReservation = async () => {
    if (!deletingReservation) return
    const deletedId = deletingReservation.id

    // Optimistic: remove from list immediately
    setReservations(prev => prev.filter(r => r.id !== deletedId))
    setShowDeleteDialog(false)
    setDeletingReservation(null)

    try {
      await supabase.from('reservation_tables').delete().eq('reservation_id', deletedId)
      const { error } = await supabase.from('reservations').delete().eq('id', deletedId)
      if (error) throw error
      toast.success('Réservation supprimée')
    } catch (error: any) {
      toast.error('Erreur de suppression', { description: error.message })
      loadReservations() // rollback
    }
  }

  const openEditDialog = (reservation: Reservation) => { setEditingReservation(reservation); setShowEditDialog(true) }
  const openDeleteDialog = (reservation: Reservation) => { setDeletingReservation(reservation); setShowDeleteDialog(true) }

  return (
    <div className="container mx-auto p-6 pb-24 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          {new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour'} {profile?.username || ''}
        </h1>
      </div>

      {/* Onglets */}
      <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
        <div className="flex gap-1 border-b min-w-max">
          <button onClick={() => setActiveTab('reservations')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reservations' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Réservations</span>
            <span className="sm:hidden">Résa</span>
          </button>
          <button onClick={() => setActiveTab('guestlist')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'guestlist' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <ListChecks className="h-4 w-4" />
            Guestlist
          </button>
          <button onClick={() => setActiveTab('plan')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'plan' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <MapPin className="h-4 w-4" />
            Plan
          </button>
          <button onClick={() => setActiveTab('shotgun')} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'shotgun' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Ticket className="h-4 w-4" />
            Shotgun
          </button>
        </div>
      </div>

      {activeTab === 'guestlist' && <GuestlistTab selectedDate={selectedDate} onDateChange={setSelectedDate} />}
      {activeTab === 'plan' && <PlanTab selectedDate={selectedDate} />}
      {activeTab === 'shotgun' && <ShotgunTab selectedDate={selectedDate} onDateChange={setSelectedDate} />}

      {activeTab === 'reservations' && (
      <>
      <div className="hidden md:block">
        <Button className="w-full h-12" onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle réservation</DialogTitle></DialogHeader>
          <NewReservationForm onSuccess={() => { setShowNewDialog(false); loadReservations() }} defaultDate={selectedDate} />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier la réservation</DialogTitle></DialogHeader>
          {editingReservation && (
            <EditReservationForm
              reservation={editingReservation}
              onSuccess={() => { setShowEditDialog(false); setEditingReservation(null); loadReservations() }}
              onCancel={() => { setShowEditDialog(false); setEditingReservation(null) }}
            />
          )}
        </DialogContent>
      </Dialog>

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
              <p className="text-sm text-muted-foreground">Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?</p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-medium">{deletingReservation.name}</p>
                <p className="text-sm text-muted-foreground">{deletingReservation.venue} • {deletingReservation.guests} personnes</p>
                <p className="text-sm text-muted-foreground">{format(new Date(deletingReservation.date), 'EEE dd MMMM', { locale: fr })}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeletingReservation(null) }}>Annuler</Button>
                <Button variant="destructive" onClick={confirmDeleteReservation}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Sélection de date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Date des réservations</label>
              <div className="relative w-full min-w-0 overflow-visible">
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full min-w-0 pr-10 appearance-none text-base min-h-[44px]" />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Salle</label>
              <Select value={venueFilter} onValueChange={(v: any) => setVenueFilter(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Melkior">Melkior</SelectItem>
                  <SelectItem value="Bal'tazar">Bal&apos;tazar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium mb-2 block">Type de table</label>
              <Select value={kindFilter} onValueChange={(v: any) => setKindFilter(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Badge variant="outline" className="ml-2">{filteredReservations.length} réservation{filteredReservations.length !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune réservation trouvée</div>
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
                      <TableRow key={reservation.id} className={getVenueRowClass(reservation.venue, reservation.status)}>
                        <TableCell className="font-medium">{reservation.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="inline-flex items-center gap-1">{renderVenueLogo(reservation.venue, 22)}</Badge>
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
                        <TableCell><div className="flex items-center"><Users className="h-3 w-3 mr-1" />{reservation.guests}</div></TableCell>
                        <TableCell><div className="flex items-center"><Euro className="h-3 w-3 mr-1" />{formatEuro(reservation.deposit_cents)}</div></TableCell>
                        <TableCell>
                          <Button variant={statusVariant(reservation.status)} size="sm" onClick={() => cycleStatus(reservation)}>{statusLabel(reservation.status)}</Button>
                        </TableCell>
                        <TableCell>{reservation.served_by_profile ? <span className="text-xs text-muted-foreground">{reservation.served_by_profile.username}</span> : null}</TableCell>
                        <TableCell>
                          {reservation.reservation_consumptions && reservation.reservation_consumptions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {reservation.reservation_consumptions.map((c, i) => (
                                <Badge key={i} variant="secondary" className="text-xs whitespace-nowrap">{c.quantity}x {(c as any).consumption_type?.name ?? `#${c.consumption_type_id}`}</Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(reservation)}><Edit className="h-3 w-3" /></Button>
                            <Button variant="outline" size="sm" onClick={() => openDeleteDialog(reservation)}><Trash2 className="h-3 w-3" /></Button>
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
                      <div className="flex items-center gap-2 min-w-0 mb-1">
                        {renderVenueLogo(reservation.venue, 20)}
                        <h3 className="font-bold text-base uppercase tracking-wide truncate">{reservation.name}</h3>
                      </div>
                      <div className="flex justify-center mb-2">
                        <Button variant={statusVariant(reservation.status)} size="sm" onClick={() => cycleStatus(reservation)}>{statusLabel(reservation.status)}</Button>
                      </div>
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
                      <div className="flex justify-center gap-6 mb-4">
                        <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{reservation.guests} pers.</span></div>
                        <div className="flex items-center gap-1.5"><Euro className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{formatEuro(reservation.deposit_cents)}</span></div>
                      </div>
                      {reservation.reservation_consumptions && reservation.reservation_consumptions.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mb-3">
                          {reservation.reservation_consumptions.map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{c.quantity}x {(c as any).consumption_type?.name ?? `#${c.consumption_type_id}`}</Badge>
                          ))}
                        </div>
                      )}
                      {reservation.notes && (
                        <div className="text-center text-xs text-muted-foreground italic mb-3 px-2">
                          {reservation.notes}
                        </div>
                      )}
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(reservation)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(reservation)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
              <div className="pt-3 mt-2 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total personnes</span>
                <span className="font-semibold">{filteredReservations.reduce((sum: number, r: any) => sum + (r?.guests || 0), 0)} pers.</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total acomptes</span>
                <span className="font-semibold">{formatEuro(filteredReservations.reduce((sum: number, r: any) => sum + (r?.deposit_cents || 0), 0))}</span>
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
