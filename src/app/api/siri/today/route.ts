import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifySiriKey(request: NextRequest): boolean {
  const key = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('key')
  const envKey = process.env.SIRI_API_KEY
  console.log('SIRI_API_KEY defined:', !!envKey, 'length:', envKey?.length, 'received key length:', key?.length, 'match:', key === envKey)
  return key === envKey
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  if (!verifySiriKey(request)) {
    return NextResponse.json({ 
      error: 'Clé API invalide',
      envKeyDefined: !!process.env.SIRI_API_KEY,
    }, { status: 401 })
  }

  const supabase = getAdmin()
  const venue = request.nextUrl.searchParams.get('venue') || null
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('reservations')
    .select('id, venue, name, guests, status')
    .eq('date', today)

  if (venue) query = query.eq('venue', venue)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const reservations = data || []
  const total = reservations.length
  const totalGuests = reservations.reduce((sum, r) => sum + (r.guests || 0), 0)

  const byStatus = {
    en_attente: reservations.filter(r => r.status === 'en_attente').length,
    arrive: reservations.filter(r => r.status === 'arrive').length,
    servi: reservations.filter(r => r.status === 'servi').length,
    termine: reservations.filter(r => r.status === 'termine').length,
  }

  const byVenue = {
    Melkior: reservations.filter(r => r.venue === 'Melkior').length,
    "Bal'tazar": reservations.filter(r => r.venue === "Bal'tazar").length,
  }

  // Texte lisible par Siri
  const parts: string[] = []
  parts.push(`${total} réservation${total > 1 ? 's' : ''} aujourd'hui pour ${totalGuests} couverts.`)
  parts.push(`${byVenue.Melkior} chez Melkior, ${byVenue["Bal'tazar"]} chez Bal'tazar.`)
  if (byStatus.en_attente > 0) parts.push(`${byStatus.en_attente} en attente.`)
  if (byStatus.arrive > 0) parts.push(`${byStatus.arrive} arrivé${byStatus.arrive > 1 ? 's' : ''}.`)
  if (byStatus.servi > 0) parts.push(`${byStatus.servi} servi${byStatus.servi > 1 ? 's' : ''}.`)

  return NextResponse.json({
    speech: parts.join(' '),
    date: today,
    total,
    totalGuests,
    byStatus,
    byVenue,
    reservations: reservations.map(r => ({
      name: r.name,
      guests: r.guests,
      venue: r.venue,
      status: r.status,
    })),
  })
}
