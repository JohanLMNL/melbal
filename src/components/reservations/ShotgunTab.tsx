'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Calendar, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ShotgunData {
  ticket_types: Array<{
    name: string
    count: number
    scanned: number
    event_name: string
  }>
  total_count: number
  total_scanned: number
  event_name: string | null
}

export function ShotgunTab({ selectedDate, onDateChange }: { selectedDate: string; onDateChange: (d: string) => void }) {
  const [data, setData] = useState<ShotgunData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadTickets() }, [selectedDate])

  const loadTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`https://datjoleofcjcpejnhddd.supabase.co/functions/v1/shotgun-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ date: selectedDate })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Erreur de chargement')
      }

      const result = await response.json()
      setData(result)
    } catch (e: any) {
      setError(e.message)
      toast.error('Erreur Shotgun', { description: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full pr-10 appearance-none text-base min-h-[44px]"
        />
        <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Billets Shotgun
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedDate), 'EEEE dd MMMM yyyy', { locale: fr })}
              </p>
              {data?.event_name && (
                <p className="text-sm font-medium mt-1">{data.event_name}</p>
              )}
            </div>
          </div>

          {data && data.total_count > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{data.total_count}</div>
                <div className="text-xs text-muted-foreground">Billets vendus</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{data.total_scanned}</div>
                <div className="text-xs text-muted-foreground">Scannés</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Chargement des billets...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={loadTickets} className="mt-2">
            Réessayer
          </Button>
        </div>
      ) : !data || data.total_count === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun billet vendu pour cette date
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Détail par type de billet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.ticket_types.map((type) => (
                <div
                  key={type.name}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{type.name}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">{type.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {type.scanned} scanné{type.scanned > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
