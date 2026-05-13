import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifySiriKey(request: NextRequest): boolean {
  const key = (request.headers.get('x-api-key') || request.nextUrl.searchParams.get('key') || '').trim()
  const envKey = (process.env.SIRI_API_KEY || '').trim()
  return key === envKey
}

function getCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  }
  const keyPath = path.join(process.cwd(), 'google-service-account.json')
  if (fs.existsSync(keyPath)) {
    return JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
  }
  throw new Error('Aucune clé Google configurée')
}

export async function GET(request: NextRequest) {
  if (!verifySiriKey(request)) {
    return NextResponse.json({ error: 'Clé API invalide' }, { status: 401 })
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: getCredentials(),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })
    const calendar = google.calendar({ version: 'v3', auth })

    const now = new Date()
    const timeMin = now.toISOString()
    const timeMax = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 semaines

    const melkiorId = process.env.GOOGLE_CALENDAR_ID_MELKIOR
    const baltazarId = process.env.GOOGLE_CALENDAR_ID_BALTAZAR

    const fetchCal = async (calendarId: string, venue: string) => {
      if (!calendarId) return []
      const res = await calendar.events.list({
        calendarId, timeMin, timeMax, singleEvents: true, orderBy: 'startTime', maxResults: 20,
      })
      return (res.data.items || []).map(item => ({
        name: item.summary || 'Sans nom',
        date: item.start?.date || item.start?.dateTime?.split('T')[0] || '',
        venue,
      }))
    }

    const [mel, bal] = await Promise.all([
      fetchCal(melkiorId || '', 'Melkior'),
      fetchCal(baltazarId || '', "Bal'tazar"),
    ])

    const events = [...mel, ...bal].sort((a, b) => a.date.localeCompare(b.date))

    // Texte lisible par Siri
    const upcoming = events.slice(0, 5)
    let speech: string
    if (upcoming.length === 0) {
      speech = 'Aucun événement prévu dans les 2 prochaines semaines.'
    } else {
      const lines = upcoming.map(e => {
        const d = new Date(e.date)
        const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        return `${e.name} chez ${e.venue}, ${jour}`
      })
      speech = `${events.length} événement${events.length > 1 ? 's' : ''} à venir. ${lines.join('. ')}.`
    }

    return NextResponse.json({ speech, total: events.length, events })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
