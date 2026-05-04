'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isBossOrAdmin } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'

type Venue = 'Melkior' | "Bal'tazar" | 'Les deux'

interface Event {
  id: string
  name: string
  date: string
  venue: Venue
  description: string | null
}

function renderVenueLogo(venue: string, size: number = 14) {
  if (venue === 'Les deux') {
    return (
      <span className="inline-flex items-center gap-0.5">
        <Image src="/logos/Mel_Logo.png" alt="Melkior" width={size} height={size} className="inline-block align-middle" />
        <Image src="/logos/Bal_Logo.png" alt="Bal'tazar" width={size} height={size} className="inline-block align-middle" />
      </span>
    )
  }
  const src = venue === "Bal'tazar" ? '/logos/Bal_Logo.png' : '/logos/Mel_Logo.png'
  return <Image src={src} alt={venue} width={size} height={size} className="inline-block align-middle" />
}

export default function CalendrierPage() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => { loadEvents() }, [currentMonth])

  const loadEvents = async () => {
    setLoading(true)
    const timeMin = startOfMonth(currentMonth).toISOString()
    const timeMax = endOfMonth(currentMonth).toISOString()

    try {
      const res = await fetch(`/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur API')
      setEvents(json.events || [])
    } catch (error: any) {
      toast.error('Erreur chargement', { description: error.message })
    }
    setLoading(false)
  }

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad beginning to start on Monday
  const startDow = (monthStart.getDay() + 6) % 7 // 0=Mon
  const padBefore = Array.from({ length: startDow }, (_, i) => null)

  const eventsByDate: Record<string, Event[]> = {}
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = []
    eventsByDate[e.date].push(e)
  })

  const canManage = isBossOrAdmin(profile)

  return (
    <div className="container mx-auto p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendrier des soirées</h1>
        <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold capitalize min-w-[180px] text-center">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grille calendrier — desktop uniquement */}
      <Card className="hidden md:block">
        <CardContent className="pt-4">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Cases du calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {padBefore.map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px]" />
            ))}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayEvents = eventsByDate[dateStr] || []
              const past = isBefore(day, startOfDay(new Date())) && !isToday(day)

              return (
                <div
                  key={dateStr}
                  className={`min-h-[80px] border rounded-md p-1 ${
                    isToday(day) ? 'border-primary bg-primary/5' : 'border-border'
                  } ${past ? 'opacity-40' : ''}`}
                >
                  <div className={`text-xs font-medium mb-0.5 ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        className={`group flex items-center gap-1 rounded px-1 py-0.5 text-[11px] leading-tight ${
                          e.venue === "Bal'tazar" ? 'bg-red-100 dark:bg-red-900/30' : e.venue === 'Les deux' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}
                      >
                        {renderVenueLogo(e.venue, 12)}
                        <span className="truncate font-medium flex-1">{e.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vue mobile — liste par jour, à venir d'abord, passées en bas */}
      {(() => {
        const today = startOfDay(new Date())
        const daysWithEvents = days.filter((day) => (eventsByDate[format(day, 'yyyy-MM-dd')] || []).length > 0)
        const upcoming = daysWithEvents.filter((day) => !isBefore(day, today))
        const past = daysWithEvents.filter((day) => isBefore(day, today))

        const renderDayCard = (day: Date, isPast: boolean) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[dateStr] || []
          return (
            <Card key={dateStr} className={isPast ? 'opacity-40' : ''}>
              <CardContent className="p-3">
                <div className={`text-sm font-semibold capitalize mb-2 ${isToday(day) ? 'text-primary' : ''}`}>
                  {isToday(day) && <Badge variant="default" className="mr-2 text-[10px] px-1.5 py-0">Aujourd&apos;hui</Badge>}
                  {format(day, 'EEEE d MMMM', { locale: fr })}
                </div>
                <div className="space-y-1.5">
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${
                        e.venue === "Bal'tazar" ? 'bg-red-100 dark:bg-red-900/30' : e.venue === 'Les deux' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}
                    >
                      {renderVenueLogo(e.venue, 18)}
                      <span className="font-medium flex-1 truncate">{e.name}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{e.venue}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

        return (
          <div className="md:hidden space-y-2">
            {upcoming.map((day) => renderDayCard(day, false))}
            {past.length > 0 && upcoming.length > 0 && (
              <div className="text-xs text-muted-foreground text-center py-2">Soirées passées</div>
            )}
            {past.map((day) => renderDayCard(day, true))}
            {daysWithEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Aucune soirée ce mois</div>
            )}
          </div>
        )
      })()}

      {/* Liste à venir — desktop uniquement (mobile a déjà la liste par jour) */}
      <Card className="hidden md:block">
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Prochaines soirées
          </h3>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Chargement...</div>
          ) : (
            <div className="space-y-2">
              {events
                .filter((e) => !isBefore(new Date(e.date), startOfDay(new Date())))
                .map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg border text-sm">
                    {renderVenueLogo(e.venue, 20)}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{e.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {format(new Date(e.date), 'EEEE dd MMMM', { locale: fr })}
                      </div>
                    </div>
                    <Badge variant="outline">{e.venue}</Badge>
                  </div>
                ))}
              {events.filter((e) => !isBefore(new Date(e.date), startOfDay(new Date()))).length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">Aucune soirée à venir ce mois</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Les événements sont gérés directement dans Google Calendar */}
    </div>
  )
}
