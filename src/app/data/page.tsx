'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, isBossOrAdmin } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Calendar, ChevronLeft, ChevronRight, BarChart3, MapPin, Clock, Utensils, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, subWeeks, addWeeks, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

type Period = 'week' | 'month'
type Venue = 'all' | 'Melkior' | "Bal'tazar"

interface DayStat {
  date: string
  total: number
  guests: number
  byStatus: Record<string, number>
}

export default function DataPage() {
  const { profile } = useAuth()
  const [period, setPeriod] = useState<Period>('week')
  const [venue, setVenue] = useState<Venue>('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reservations, setReservations] = useState<any[]>([])
  const [events, setEvents] = useState<Record<string, string[]>>({})
  const [shotgun, setShotgun] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const range = useMemo(() => {
    if (period === 'week') {
      return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) }
    }
    return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) }
  }, [period, currentDate])

  useEffect(() => { loadData() }, [range, venue])

  const loadData = async () => {
    setLoading(true)
    const startStr = format(range.start, 'yyyy-MM-dd')
    const endStr = format(range.end, 'yyyy-MM-dd')

    let query = supabase
      .from('reservations')
      .select('id, venue, date, guests, status, deposit_cents')
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date', { ascending: true })

    if (venue !== 'all') query = query.eq('venue', venue)

    // Fetch réservations + events calendrier en parallèle
    const [resResult, eventsResult] = await Promise.all([
      query,
      fetch(`/api/calendar/events?timeMin=${encodeURIComponent(range.start.toISOString())}&timeMax=${encodeURIComponent(range.end.toISOString())}`)
        .then(r => r.ok ? r.json() : { events: [] })
        .catch(() => ({ events: [] }))
    ])

    if (resResult.error) {
      toast.error('Erreur chargement', { description: resResult.error.message })
    } else {
      setReservations(resResult.data || [])
    }

    // Grouper les events par date
    const eventMap: Record<string, string[]> = {}
    for (const ev of (eventsResult.events || [])) {
      if (!eventMap[ev.date]) eventMap[ev.date] = []
      eventMap[ev.date].push(ev.name)
    }
    setEvents(eventMap)

    // Fetch Shotgun pour chaque soir d'ouverture (jeu/ven/sam)
    const openDays = eachDayOfInterval({ start: range.start, end: range.end })
      .filter(d => [4, 5, 6].includes(d.getDay()))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const shotgunResults = await Promise.all(
        openDays.map(async (d) => {
          const dateStr = format(d, 'yyyy-MM-dd')
          try {
            const res = await fetch('https://datjoleofcjcpejnhddd.supabase.co/functions/v1/shotgun-tickets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ date: dateStr })
            })
            if (!res.ok) return { date: dateStr, count: 0 }
            const json = await res.json()
            const count = json.tickets?.length || json.total_count || 0
            return { date: dateStr, count }
          } catch { return { date: dateStr, count: 0 } }
        })
      )
      const shotgunMap: Record<string, number> = {}
      shotgunResults.forEach(r => { shotgunMap[r.date] = r.count })
      setShotgun(shotgunMap)
    } catch { setShotgun({}) }

    setLoading(false)
  }

  const navigate = (dir: -1 | 1) => {
    setCurrentDate(prev => period === 'week'
      ? (dir === -1 ? subWeeks(prev, 1) : addWeeks(prev, 1))
      : (dir === -1 ? subMonths(prev, 1) : addMonths(prev, 1))
    )
  }

  // Stats globales
  const totalReservations = reservations.length
  const totalGuests = reservations.reduce((s, r) => s + (r.guests || 0), 0)
  const totalDeposits = reservations.reduce((s, r) => s + (r.deposit_cents || 0), 0)
  const avgGuests = totalReservations > 0 ? Math.round(totalGuests / totalReservations * 10) / 10 : 0
  // Nombre de soirs d'ouverture (jeu, ven, sam) dans la période
  const openNights = eachDayOfInterval({ start: range.start, end: range.end })
    .filter(d => [4, 5, 6].includes(d.getDay())).length // 4=jeu, 5=ven, 6=sam
  const avgReservationsPerNight = openNights > 0 ? Math.round(totalReservations / openNights * 10) / 10 : 0
  const avgGuestsPerNight = openNights > 0 ? Math.round(totalGuests / openNights * 10) / 10 : 0

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {}
    reservations.forEach(r => { map[r.status] = (map[r.status] || 0) + 1 })
    return map
  }, [reservations])

  const byVenue = useMemo(() => {
    const mel = reservations.filter(r => r.venue === 'Melkior')
    const bal = reservations.filter(r => r.venue === "Bal'tazar")
    return {
      Melkior: { count: mel.length, guests: mel.reduce((s, r) => s + (r.guests || 0), 0) },
      "Bal'tazar": { count: bal.length, guests: bal.reduce((s, r) => s + (r.guests || 0), 0) },
    }
  }, [reservations])

  // Stats par jour
  const dailyStats = useMemo(() => {
    const days = eachDayOfInterval({ start: range.start, end: range.end })
    const map = new Map<string, DayStat>()

    days.forEach(d => {
      const key = format(d, 'yyyy-MM-dd')
      map.set(key, { date: key, total: 0, guests: 0, byStatus: {} })
    })

    reservations.forEach(r => {
      const stat = map.get(r.date)
      if (stat) {
        stat.total++
        stat.guests += r.guests || 0
        stat.byStatus[r.status] = (stat.byStatus[r.status] || 0) + 1
      }
    })

    return Array.from(map.values())
  }, [reservations, range])

  const maxGuests = Math.max(...dailyStats.map(d => d.guests), 1)
  const maxTotal = Math.max(...dailyStats.map(d => d.total), 1)

  if (!isBossOrAdmin(profile)) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground">Accès réservé aux administrateurs.</p>
      </div>
    )
  }

  const statusLabel: Record<string, string> = {
    en_attente: 'En attente',
    arrive: 'Arrivé',
    servi: 'Servi',
    termine: 'Terminé',
    annule: 'Annulé',
  }

  const statusColor: Record<string, string> = {
    en_attente: 'bg-amber-500',
    arrive: 'bg-blue-500',
    servi: 'bg-green-500',
    termine: 'bg-gray-400',
    annule: 'bg-red-400',
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Data</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={venue} onValueChange={(v) => setVenue(v as Venue)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes salles</SelectItem>
                <SelectItem value="Melkior">Melkior</SelectItem>
                <SelectItem value="Bal'tazar">Bal&apos;tazar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[160px] text-center">
                {period === 'week'
                  ? `${format(range.start, 'd MMM', { locale: fr })} — ${format(range.end, 'd MMM yyyy', { locale: fr })}`
                  : format(currentDate, 'MMMM yyyy', { locale: fr })
                }
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Calendar className="h-3.5 w-3.5" />
                Réservations
              </div>
              <p className="text-2xl font-bold">{totalReservations}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Users className="h-3.5 w-3.5" />
                Personnes
              </div>
              <p className="text-2xl font-bold">{totalGuests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Moy. personnes/résa
              </div>
              <p className="text-2xl font-bold">{avgGuests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Calendar className="h-3.5 w-3.5" />
                Moy. résa/soir
              </div>
              <p className="text-2xl font-bold">{avgReservationsPerNight}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Users className="h-3.5 w-3.5" />
                Moy. personnes/soir
              </div>
              <p className="text-2xl font-bold">{avgGuestsPerNight}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Utensils className="h-3.5 w-3.5" />
                Acomptes
              </div>
              <p className="text-2xl font-bold">{(totalDeposits / 100).toFixed(0)}€</p>
            </CardContent>
          </Card>
        </div>

        {/* Par salle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['Melkior', "Bal'tazar"] as const).map(v => (
            <Card key={v}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-sm">{v}</span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-bold">{byVenue[v].count}</p>
                    <p className="text-xs text-muted-foreground">réservations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{byVenue[v].guests}</p>
                    <p className="text-xs text-muted-foreground">personnes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Répartition par statut */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Répartition par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${statusColor[status] || 'bg-gray-300'}`} />
                  <span className="text-sm">{statusLabel[status] || status}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </div>
              ))}
              {Object.keys(byStatus).length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune réservation sur cette période.</p>
              )}
            </div>
            {totalReservations > 0 && (
              <div className="flex h-4 rounded-full overflow-hidden mt-4">
                {Object.entries(byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className={`${statusColor[status] || 'bg-gray-300'} transition-all`}
                    style={{ width: `${(count / totalReservations) * 100}%` }}
                    title={`${statusLabel[status] || status}: ${count}`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique personnes par jour */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Personnes par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1" style={{ height: 160 }}>
              {dailyStats.map(day => {
                const barH = maxGuests > 0 ? (day.guests / maxGuests) * 130 : 0
                const date = parseISO(day.date)
                const today = isToday(date)
                const dayEvents = events[day.date]
                const tooltip = dayEvents ? dayEvents.join(' + ') : ''
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full group relative" title={tooltip}>
                    {tooltip && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 px-2 py-1 rounded bg-popover border shadow-md text-[10px] font-medium whitespace-nowrap">
                        {tooltip}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium mb-1">{day.guests || ''}</span>
                    <div
                      className={`w-full max-w-[32px] mx-auto rounded-t-sm cursor-pointer ${today ? 'bg-primary' : dayEvents ? 'bg-primary/70' : 'bg-primary/40'}`}
                      style={{ height: Math.max(barH, day.guests > 0 ? 4 : 0) }}
                    />
                    <span className={`text-[10px] mt-1 ${today ? 'font-bold' : dayEvents ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {format(date, period === 'week' ? 'EEE' : 'd', { locale: fr })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Graphique réservations par jour */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Réservations par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1" style={{ height: 140 }}>
              {dailyStats.map(day => {
                const barH = maxTotal > 0 ? (day.total / maxTotal) * 110 : 0
                const date = parseISO(day.date)
                const today = isToday(date)
                const dayEvents = events[day.date]
                const tooltip = dayEvents ? dayEvents.join(' + ') : ''
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full group relative" title={tooltip}>
                    {tooltip && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 px-2 py-1 rounded bg-popover border shadow-md text-[10px] font-medium whitespace-nowrap">
                        {tooltip}
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium mb-1">{day.total || ''}</span>
                    <div
                      className={`w-full max-w-[32px] mx-auto rounded-t-sm cursor-pointer ${today ? 'bg-emerald-500' : dayEvents ? 'bg-emerald-500/70' : 'bg-emerald-500/40'}`}
                      style={{ height: Math.max(barH, day.total > 0 ? 4 : 0) }}
                    />
                    <span className={`text-[10px] ${today ? 'font-bold' : dayEvents ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {format(date, period === 'week' ? 'EEE' : 'd', { locale: fr })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Graphique entrées Shotgun */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" /> Entrées Shotgun par soir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const shotgunDays = eachDayOfInterval({ start: range.start, end: range.end })
                .filter(d => [4, 5, 6].includes(d.getDay()))
              const maxShotgun = Math.max(...shotgunDays.map(d => shotgun[format(d, 'yyyy-MM-dd')] || 0), 1)
              const totalShotgun = shotgunDays.reduce((s, d) => s + (shotgun[format(d, 'yyyy-MM-dd')] || 0), 0)
              return (
                <>
                  <p className="text-xs text-muted-foreground mb-3">Total : <span className="font-semibold text-foreground">{totalShotgun} entrées</span></p>
                  <div className="flex items-end gap-2" style={{ height: 140 }}>
                    {shotgunDays.map(d => {
                      const dateStr = format(d, 'yyyy-MM-dd')
                      const count = shotgun[dateStr] || 0
                      const barH = maxShotgun > 0 ? (count / maxShotgun) * 110 : 0
                      const today = isToday(d)
                      const dayEvents = events[dateStr]
                      const tooltip = dayEvents ? `${dayEvents.join(' + ')} — ${count} entrées` : `${count} entrées`
                      return (
                        <div key={dateStr} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full group relative" title={tooltip}>
                          {tooltip && (
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 px-2 py-1 rounded bg-popover border shadow-md text-[10px] font-medium whitespace-nowrap">
                              {tooltip}
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground font-medium mb-1">{count || ''}</span>
                          <div
                            className={`w-full max-w-[32px] mx-auto rounded-t-sm cursor-pointer ${today ? 'bg-violet-500' : count > 0 ? 'bg-violet-500/70' : 'bg-violet-500/20'}`}
                            style={{ height: Math.max(barH, count > 0 ? 4 : 0) }}
                          />
                          <span className={`text-[10px] mt-1 ${today ? 'font-bold' : 'text-muted-foreground'}`}>
                            {format(d, 'EEE d', { locale: fr })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>

        {/* Top soirées */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top soirées de la période
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const ranked = [...dailyStats]
                .filter(d => d.guests > 0)
                .sort((a, b) => b.guests - a.guests)
                .slice(0, 5)
              if (ranked.length === 0) return <p className="text-sm text-muted-foreground">Aucune donnée.</p>
              return (
                <div className="space-y-2">
                  {ranked.map((day, i) => {
                    const date = parseISO(day.date)
                    const dayEvents = events[day.date]
                    const label = dayEvents ? dayEvents.join(' + ') : format(date, 'EEEE d MMMM', { locale: fr })
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''
                    return (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-lg w-7 text-center">{medal || `${i + 1}.`}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{label}</p>
                          <p className="text-xs text-muted-foreground">{format(date, 'EEEE d MMMM', { locale: fr })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{day.guests} pers.</p>
                          <p className="text-xs text-muted-foreground">{day.total} résa{day.total > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </CardContent>
        </Card>
    </div>
  )
}
