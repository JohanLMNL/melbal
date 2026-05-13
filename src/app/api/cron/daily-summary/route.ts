import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  // Vérifier que l'appel vient de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdmin()
  const today = new Date().toISOString().split('T')[0]

  // Charger les réservations du jour
  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, venue, guests, status')
    .eq('date', today)

  const total = reservations?.length || 0
  const guests = reservations?.reduce((s, r) => s + (r.guests || 0), 0) || 0
  const melkior = reservations?.filter(r => r.venue === 'Melkior').length || 0
  const baltazar = reservations?.filter(r => r.venue === "Bal'tazar").length || 0

  // Construire le message
  const lines: string[] = []
  lines.push(`📊 Résumé du soir — ${today}`)
  lines.push('')
  if (total === 0) {
    lines.push('Aucune réservation ce soir.')
  } else {
    lines.push(`🎫 ${total} réservation${total > 1 ? 's' : ''} — ${guests} personnes`)
    lines.push(`🍷 Melkior: ${melkior} | 🎭 Bal'tazar: ${baltazar}`)
  }

  const message = lines.join('\n')

  // Envoyer via ntfy
  const topic = process.env.NTFY_TOPIC || 'melbal-johan'
  try {
    const ntfyRes = await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Title': encodeURIComponent(`MelbalApp — ${total} résa${total > 1 ? 's' : ''} ce soir`),
        'Priority': total > 0 ? '4' : '3',
        'Tags': 'bar_chart',
      },
      body: message,
    })
    if (!ntfyRes.ok) {
      const errText = await ntfyRes.text()
      console.error('Erreur ntfy:', ntfyRes.status, errText)
      return NextResponse.json({ error: 'Erreur envoi notification', details: errText }, { status: 500 })
    }
  } catch (err: any) {
    console.error('Erreur ntfy:', err)
    return NextResponse.json({ error: 'Erreur envoi notification', details: err.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message })
}
