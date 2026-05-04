'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'

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

export function PlanTab({ selectedDate }: { selectedDate: string }) {
  const [venue, setVenue] = useState<Venue>('Melkior')
  const [tables, setTables] = useState<TableWithPosition[]>([])
  const [reservedTables, setReservedTables] = useState<Record<number, { status: 'en_attente' | 'arrive' | 'servi'; name: string; guests: number; servedByName?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { loadData() }, [venue, selectedDate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tablesRes, reservationsRes] = await Promise.all([
        supabase.from('tables').select('id, table_number, kind, pos_x, pos_y, occupied, occupied_by').eq('venue', venue),
        supabase.from('reservations').select('id, name, guests, status, served_by, reservation_tables(table_number)').eq('venue', venue).eq('date', selectedDate).in('status', ['en_attente', 'arrive', 'servi'])
      ])
      if (tablesRes.error) throw tablesRes.error
      if (reservationsRes.error) throw reservationsRes.error

      const tablesData = tablesRes.data || []
      const reservationsData = reservationsRes.data || []

      const userIds = new Set<string>()
      tablesData.forEach(t => { if (t.occupied_by) userIds.add(t.occupied_by) })
      reservationsData.forEach((r: any) => { if (r.served_by) userIds.add(r.served_by) })

      let profileMap: Record<string, string> = {}
      if (userIds.size > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', Array.from(userIds))
        profiles?.forEach(p => { profileMap[p.id] = p.username || 'Inconnu' })
      }

      setTables(tablesData.map(t => ({ ...t, occupiedByName: t.occupied_by ? profileMap[t.occupied_by] : undefined })))

      const reserved: typeof reservedTables = {}
      reservationsData.forEach((r: any) => {
        const status = r.status as 'en_attente' | 'arrive' | 'servi'
        r.reservation_tables?.forEach((rt: any) => {
          const n = rt.table_number as number
          const ex = reserved[n]
          if (!ex || status === 'servi' || (status === 'arrive' && ex.status === 'en_attente')) {
            reserved[n] = { status, name: r.name || 'Sans nom', guests: r.guests || 0, servedByName: r.served_by ? profileMap[r.served_by] : undefined }
          }
        })
      })
      setReservedTables(reserved)
    } catch (e: any) {
      toast.error('Erreur de chargement', { description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const planSrc = venue === "Bal'tazar" ? '/plans/planTableBalta.png' : '/plans/planTableMelkior.png'

  const toggleOccupied = async (tableId: number, current: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, occupied: !current, occupied_by: !current ? user?.id : null, occupiedByName: !current ? 'Vous' : undefined } : t))
      const updateData = !current ? { occupied: true, occupied_by: user?.id || null } : { occupied: false, occupied_by: null }
      const { error } = await supabase.from('tables').update(updateData).eq('id', tableId)
      if (error) throw error
      toast.success(`Table ${current ? 'libérée' : 'marquée occupée'}`)
    } catch (e: any) {
      loadData()
      toast.error('Erreur', { description: e.message })
    }
  }

  const getStyle = (isReserved: boolean, status: string | undefined, isOccupied: boolean) => {
    if (status === 'en_attente') return 'bg-white text-red-700 border-red-600 cursor-default bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,#dc2626_3px,#dc2626_6px)]'
    if (status === 'arrive') return 'bg-red-500 text-white border-red-600 cursor-default'
    if (status === 'servi') return 'bg-red-500 text-white border-4 border-green-500 cursor-default'
    if (isOccupied) return 'bg-orange-500 text-white border-orange-600 cursor-pointer hover:bg-orange-600'
    return 'bg-white text-black border-black cursor-pointer hover:bg-gray-100 shadow-sm'
  }

  const getTooltipText = (t: TableWithPosition, info: typeof reservedTables[number] | undefined) => {
    if (info) {
      const base = `${info.name}\n${info.guests} pers.`
      if (info.status === 'servi' && info.servedByName) return `${base}\nServi par ${info.servedByName}`
      return `${base}\n${info.status === 'en_attente' ? 'En attente' : 'Arrivé'}`
    }
    if (t.occupied) {
      const byWho = t.occupiedByName ? ` par ${t.occupiedByName}` : ''
      return `Table ${t.table_number}\nOccupée${byWho}`
    }
    return `Table ${t.table_number}\nLibre`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Salle</label>
            <div className="flex gap-2">
              <Button variant={venue === 'Melkior' ? 'default' : 'outline'} size="sm" onClick={() => setVenue('Melkior')}>Melkior</Button>
              <Button variant={venue === "Bal'tazar" ? 'default' : 'outline'} size="sm" onClick={() => setVenue("Bal'tazar")}>Bal&apos;tazar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Plan – {venue}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <>
              <div className="md:hidden mb-2 text-xs text-muted-foreground flex items-center gap-1">
                <span>→</span> Glissez pour voir le plan entier
              </div>
              <div className="relative w-full overflow-x-auto md:overflow-visible border rounded-md bg-muted">
                <div className="relative min-w-[600px] md:min-w-0 md:w-full">
                  <Image src={planSrc} alt={`Plan ${venue}`} width={1200} height={800} className="w-full h-auto" />
                  <div className="absolute inset-0">
                    {tables.map((t) => {
                      if (typeof t.pos_x !== 'number' || typeof t.pos_y !== 'number') return null
                      const info = reservedTables[t.table_number]
                      const isReserved = !!info
                      const isTooltipVisible = activeTooltip === t.table_number
                      const showTooltip = () => setActiveTooltip(t.table_number)
                      const hideTooltip = () => setActiveTooltip(null)
                      const handleTouchStart = () => { longPressTimer.current = setTimeout(showTooltip, 500) }
                      const handleTouchEnd = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }; setTimeout(hideTooltip, 2000) }

                      return (
                        <div key={t.id} className="absolute group" style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)', zIndex: isTooltipVisible ? 999 : 50 }}>
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[1000] transition-opacity duration-200 ${isTooltipVisible ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                            <div className="bg-black text-white text-xs px-2 py-1.5 rounded shadow-lg whitespace-pre text-center min-w-[80px]">
                              {getTooltipText(t, info)}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`rounded-full border-2 text-sm md:text-xs font-bold flex items-center justify-center transition-colors ${getStyle(isReserved, info?.status, t.occupied)} md:w-8 md:h-8 w-10 h-10`}
                            onClick={() => !isReserved && toggleOccupied(t.id, t.occupied)}
                            onMouseEnter={showTooltip} onMouseLeave={hideTooltip}
                            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                            disabled={isReserved}
                          >
                            {t.table_number}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white border-2 border-black"></span><span>Libre</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-600"></span><span>Occupée</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white border-2 border-red-600 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#dc2626_2px,#dc2626_4px)]"></span><span>En attente</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></span><span>Arrivé</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500 border-4 border-green-500"></span><span>Servi</span></div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Cliquez sur une table libre pour la marquer comme occupée, ou sur une table occupée pour la libérer.</p>
        </CardContent>
      </Card>
    </div>
  )
}
