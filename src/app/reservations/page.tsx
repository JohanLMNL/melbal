'use client'

import { useState, useEffect } from 'react'
import { supabase, type Reservation, type Profile, type Table, canManageReservations } from '@/lib/supabase'
import { formatEuro } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Euro, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
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
  }, [selectedDate])

  useEffect(() => {
    loadProfile()
  }, [])

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MelbalApp</h1>
          <p className="text-muted-foreground">
            Système de réservation - {profile?.username} ({profile?.role})
          </p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle réservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
          <DialogContent className="max-w-2xl">
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
          <DialogContent className="max-w-md">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sélection de date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Date des réservations</label>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Réservations du {format(new Date(selectedDate), 'EEE dd MMMM', { locale: fr })}
            <Badge variant="outline" className="ml-2">
              {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : reservations.length === 0 ? (
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
                    {reservations.map((reservation) => (
                      <TableRow 
                        key={reservation.id}
                        className={getVenueRowClass(reservation.venue, reservation.arrived)}
                      >
                        <TableCell className="font-medium">{reservation.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {reservation.venue}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reservation.reservation_tables?.map(rt => rt.table_number).join(', ')}
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
                {reservations.map((reservation) => (
                  <Card key={reservation.id} className={getVenueCardClass(reservation.venue, reservation.arrived)}>
                    <CardContent className="p-4">
                      {/* En-tête avec nom et statut */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{reservation.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {reservation.venue}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Tables: {reservation.reservation_tables?.map(rt => rt.table_number).join(', ') || 'Aucune'}
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
  const [loading, setLoading] = useState(false)

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
    const { data: allTables } = await supabase
      .from('tables')
      .select('*')
      .eq('venue', formData.venue)
      .order('table_number')

    const { data: reservedTables } = await supabase
      .from('reservation_tables')
      .select('table_number')
      .eq('venue', formData.venue)
      .eq('date', formData.date)
      .neq('reservation_id', reservation.id) // Exclure les tables de cette réservation

    const reservedNumbers = reservedTables?.map(rt => rt.table_number) || []
    const available = allTables?.filter(table => !reservedNumbers.includes(table.table_number)) || []
    
    setAvailableTables(available)
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
        <label className="text-sm font-medium mb-2 block">
          Tables disponibles ({availableTables.length} libres)
        </label>
        <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
          {availableTables.map((table) => (
            <Button
              key={table.id}
              type="button"
              variant={formData.tables.includes(table.table_number) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newTables = formData.tables.includes(table.table_number)
                  ? formData.tables.filter(t => t !== table.table_number)
                  : [...formData.tables, table.table_number]
                setFormData({...formData, tables: newTables})
              }}
            >
              {table.table_number}
            </Button>
          ))}
        </div>
        {formData.tables.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Tables sélectionnées: {formData.tables.sort((a, b) => a - b).join(', ')}
          </p>
        )}
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAvailableTables()
  }, [formData.venue, formData.date])

  const loadAvailableTables = async () => {
    // Charger toutes les tables de la salle
    const { data: allTables } = await supabase
      .from('tables')
      .select('*')
      .eq('venue', formData.venue)
      .order('table_number')

    // Charger les tables déjà réservées
    const { data: reservedTables } = await supabase
      .from('reservation_tables')
      .select('table_number')
      .eq('venue', formData.venue)
      .eq('date', formData.date)

    const reservedNumbers = reservedTables?.map(rt => rt.table_number) || []
    const available = allTables?.filter(table => !reservedNumbers.includes(table.table_number)) || []
    
    setAvailableTables(available)
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
        <label className="text-sm font-medium mb-2 block">
          Tables disponibles ({availableTables.length} libres)
        </label>
        <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
          {availableTables.map((table) => (
            <Button
              key={table.id}
              type="button"
              variant={formData.tables.includes(table.table_number) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newTables = formData.tables.includes(table.table_number)
                  ? formData.tables.filter(t => t !== table.table_number)
                  : [...formData.tables, table.table_number]
                setFormData({...formData, tables: newTables})
              }}
            >
              {table.table_number}
            </Button>
          ))}
        </div>
        {formData.tables.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Tables sélectionnées: {formData.tables.sort((a, b) => a - b).join(', ')}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer la réservation'}
        </Button>
      </div>
    </form>
  )
}
