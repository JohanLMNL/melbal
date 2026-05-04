'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Users, Calendar, AlertTriangle, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

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

export function GuestlistTab({ selectedDate, onDateChange }: { selectedDate: string; onDateChange: (d: string) => void }) {
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
    // Optimistic update
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: next } : e))
    const { error } = await supabase.from('guestlist').update({ status: next }).eq('id', entry.id)
    if (error) {
      toast.error('Erreur', { description: error.message })
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: entry.status } : e))
    }
  }

  const total = entries.reduce((sum, e) => sum + e.guests, 0)

  return (
    <div className="space-y-4">
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
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="font-bold uppercase tracking-wide truncate text-base">{entry.name}</span>
                    <Badge variant="secondary" className="shrink-0">
                      <Users className="h-3 w-3 mr-1" />
                      {entry.guests} pers.
                    </Badge>
                  </div>
                  {entry.notes && <p className="text-xs text-muted-foreground truncate">{entry.notes}</p>}
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
