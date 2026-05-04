import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook pour charger les types de tables (assises/haute/vip) depuis Supabase directement.
 * Retourne un map "venue:table_number" → kind.
 */
export function useTableKinds() {
  const [tableKinds, setTableKinds] = useState<Record<string, 'assises' | 'haute' | 'vip'>>({})

  useEffect(() => {
    supabase
      .from('tables')
      .select('venue, table_number, kind')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, 'assises' | 'haute' | 'vip'> = {}
        data.forEach((t: any) => { map[`${t.venue}:${t.table_number}`] = t.kind })
        setTableKinds(map)
      })
  }, [])

  return tableKinds
}
