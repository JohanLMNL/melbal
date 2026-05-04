"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { apiFetch } from "@/lib/api-fetch"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { type Table as TableModel, type Venue } from "@/lib/supabase"

const VENUES: Venue[] = ["Melkior", "Bal'tazar"]

export default function PositionsEditorPage() {
  const [venue, setVenue] = useState<Venue>('Melkior')
  const [tables, setTables] = useState<TableModel[]>([])
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  useEffect(() => {
    loadTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue])

  const planSrc = useMemo(() => venue === "Bal'tazar" ? '/plans/planTableBalta.png' : '/plans/planTableMelkior.png', [venue])

  const loadTables = async () => {
    try {
      const res = await apiFetch('/api/admin/tables/list', {
        method: 'POST',
        body: JSON.stringify({ venue })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Erreur API')
      setTables((j.tables || []) as TableModel[])
    } catch (e: any) {
      toast.error('Erreur de chargement', { description: e.message })
    }
  }

  const onPointerDown = (e: React.PointerEvent, id: number) => {
    const el = e.currentTarget as HTMLButtonElement
    el.setPointerCapture(e.pointerId)
    setDraggingId(id)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return
    const cont = containerRef.current
    if (!cont) return
    const rect = cont.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const nx = Math.max(0, Math.min(100, x))
    const ny = Math.max(0, Math.min(100, y))
    setTables(prev => prev.map(t => t.id === draggingId ? { ...t, pos_x: nx, pos_y: ny } : t))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingId) return
    const el = e.currentTarget as HTMLButtonElement
    try { el.releasePointerCapture(e.pointerId) } catch {}
    setDraggingId(null)
  }

  const savePositions = async () => {
    setSaving(true)
    try {
      const items = tables
        .filter(t => typeof t.pos_x === 'number' && typeof t.pos_y === 'number')
        .map(t => ({ id: t.id, pos_x: t.pos_x!, pos_y: t.pos_y! }))
      if (items.length === 0) { toast.message('Aucune position à enregistrer'); setSaving(false); return }
      const res = await apiFetch('/api/admin/tables/positions', {
        method: 'POST',
        body: JSON.stringify({ items })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Erreur API')
      toast.success(`Positions enregistrées (${j.count})`)
    } catch (e: any) {
      toast.error('Erreur enregistrement', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold">Éditeur de position des tables</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={venue} onValueChange={(v: any) => setVenue(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENUES.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={savePositions} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan – {venue}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="relative w-full border rounded-md overflow-hidden bg-muted select-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <Image src={planSrc} alt={`Plan ${venue}`} width={1600} height={1000} className="w-full h-auto pointer-events-none" />
            {/* Overlay: absolute positions */}
            <div className="absolute inset-0">
              {tables.map((t) => {
                const hasPos = typeof t.pos_x === 'number' && typeof t.pos_y === 'number'
                const left = hasPos ? `${t.pos_x}%` : undefined
                const top = hasPos ? `${t.pos_y}%` : undefined
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border text-[10px] md:text-xs font-medium flex items-center justify-center ${t.kind === 'vip' ? 'bg-yellow-500 text-black border-yellow-500' : t.kind === 'haute' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-foreground text-background border-foreground'}`}
                    style={{ left, top, width: 28, height: 28, borderRadius: 9999 }}
                    onPointerDown={(e) => onPointerDown(e, t.id)}
                    title={`Table ${t.table_number}`}
                  >
                    {t.table_number}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Astuce: cliquez puis déplacez une pastille pour la repositionner. Les coordonnées sont enregistrées en pourcentage pour rester responsive.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
