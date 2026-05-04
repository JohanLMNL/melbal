'use client'

import { useState, useEffect } from 'react'
import { supabase, type Reservation, type Table, type ConsumptionType } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ConsumptionPicker } from './ConsumptionPicker'
import { TablePlanPicker } from './TablePlanPicker'

export function EditReservationForm({
  reservation, onSuccess, onCancel
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
  const [allTables, setAllTables] = useState<Table[]>([])
  const [reservedNumbers, setReservedNumbers] = useState<number[]>([])
  const [reservedInfo, setReservedInfo] = useState<Record<number, { name: string; guests: number }>>({})
  const [loading, setLoading] = useState(false)
  const [showTablePicker, setShowTablePicker] = useState(false)

  useEffect(() => { loadAvailableTables(); loadCurrentTables() }, [formData.venue, formData.date])

  useEffect(() => {
    supabase.from('consumption_types').select('*').order('sort_order').then(({ data }) => {
      if (data) setConsumptionTypes(data)
    })
  }, [])

  const loadCurrentTables = async () => {
    const { data } = await supabase.from('reservation_tables').select('table_number').eq('reservation_id', reservation.id)
    if (data) setFormData(prev => ({ ...prev, tables: data.map(rt => rt.table_number) }))
  }

  const loadAvailableTables = async () => {
    const [tablesRes, reservedRes] = await Promise.all([
      supabase.from('tables').select('*').eq('venue', formData.venue).order('table_number'),
      supabase.from('reservation_tables').select('table_number, reservations(name, guests)').eq('venue', formData.venue).eq('date', formData.date).neq('reservation_id', reservation.id)
    ])
    const resNums = reservedRes.data?.map(rt => rt.table_number) || []
    setAllTables(tablesRes.data || [])
    setReservedNumbers(resNums)
    const info: Record<number, { name: string; guests: number }> = {}
    ;(reservedRes.data || []).forEach((rt: any) => {
      const r = rt.reservations
      if (r && typeof rt.table_number === 'number') info[rt.table_number] = { name: r.name, guests: r.guests }
    })
    setReservedInfo(info)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          venue: formData.venue, date: formData.date, name: formData.name,
          guests: parseInt(formData.guests),
          deposit_cents: formData.deposit ? Math.round(parseFloat(formData.deposit) * 100) : null,
          phone: formData.phone || null, notes: formData.notes || null,
        })
        .eq('id', reservation.id)
      if (reservationError) throw reservationError

      // Delete old tables & consumptions in parallel
      await Promise.all([
        supabase.from('reservation_tables').delete().eq('reservation_id', reservation.id),
        supabase.from('reservation_consumptions').delete().eq('reservation_id', reservation.id)
      ])

      // Insert new tables & consumptions in parallel
      const inserts: PromiseLike<any>[] = []
      if (formData.tables.length > 0) {
        inserts.push(supabase.from('reservation_tables').insert(
          formData.tables.map(n => ({ reservation_id: reservation.id, venue: formData.venue, table_number: n, date: formData.date }))
        ).then(r => { if (r.error) throw r.error }))
      }
      if (consumptions.length > 0) {
        inserts.push(supabase.from('reservation_consumptions').insert(
          consumptions.map(c => ({ reservation_id: reservation.id, consumption_type_id: c.consumption_type_id, quantity: c.quantity }))
        ).then(r => { if (r.error) throw r.error }))
      }
      if (inserts.length > 0) await Promise.all(inserts)

      toast.success('Réservation modifiée avec succès')
      onSuccess()
    } catch (error: any) {
      toast.error('Erreur de modification', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Salle</label>
          <Select value={formData.venue} onValueChange={(value: any) => setFormData({ ...formData, venue: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Melkior">Melkior</SelectItem>
              <SelectItem value="Bal'tazar">Bal&apos;tazar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full min-w-0 text-base min-h-[44px]" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Nom du client</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="text-base min-h-[44px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre de personnes</label>
          <Input type="number" min="1" value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })} required className="text-base min-h-[44px]" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Acompte (€)</label>
          <Input type="number" step="0.01" min="0" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} className="text-base min-h-[44px]" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Téléphone</label>
        <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="text-base min-h-[44px]" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Notes</label>
        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Notes sur la réservation..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Sélection des tables</label>
        <div className="flex gap-2 items-center">
          <Button type="button" variant="outline" onClick={() => setShowTablePicker(true)}>Choisir la table</Button>
          <span className="text-sm text-muted-foreground">
            {formData.tables.length > 0 ? `Tables: ${formData.tables.sort((a, b) => a - b).join(', ')}` : 'Aucune sélection'}
          </span>
        </div>
        <Dialog open={showTablePicker} onOpenChange={setShowTablePicker}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Choisir la table – {formData.venue}</DialogTitle></DialogHeader>
            <TablePlanPicker venue={formData.venue} tables={allTables} reserved={reservedNumbers} reservedInfo={reservedInfo} selected={formData.tables} onChange={(tables) => setFormData({ ...formData, tables })} />
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Consommations prévues</label>
        <ConsumptionPicker consumptionTypes={consumptionTypes} value={consumptions} onChange={setConsumptions} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Modification...' : 'Modifier la réservation'}</Button>
      </div>
    </form>
  )
}
