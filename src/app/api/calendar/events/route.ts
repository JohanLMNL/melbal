import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import path from 'path'
import fs from 'fs'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

function getAuth() {
  const keyPath = path.join(process.cwd(), 'google-service-account.json')
  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })
}

type Venue = 'Melkior' | "Bal'tazar" | 'Les deux'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')
    const melkiorId = process.env.GOOGLE_CALENDAR_ID_MELKIOR
    const baltazarId = process.env.GOOGLE_CALENDAR_ID_BALTAZAR

    if (!melkiorId && !baltazarId) {
      return NextResponse.json({ error: 'Aucun GOOGLE_CALENDAR_ID configuré' }, { status: 500 })
    }

    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const fetchCalendar = async (calendarId: string, venue: Venue) => {
      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin || undefined,
        timeMax: timeMax || undefined,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      })
      return (response.data.items || []).map((item) => {
        const start = item.start?.date || item.start?.dateTime?.split('T')[0] || ''
        return {
          id: item.id,
          name: item.summary || 'Sans nom',
          date: start,
          venue,
          description: item.description || null,
        }
      })
    }

    // Fetch les 2 calendriers en parallèle
    const [melkiorEvents, baltazarEvents] = await Promise.all([
      melkiorId ? fetchCalendar(melkiorId, 'Melkior') : Promise.resolve([]),
      baltazarId ? fetchCalendar(baltazarId, "Bal'tazar") : Promise.resolve([]),
    ])

    // Détecter les événements identiques (même nom + même date) → "Les deux"
    const allEvents: typeof melkiorEvents = []
    const baltazarMap = new Map(baltazarEvents.map(e => [`${e.date}:${e.name.toLowerCase().trim()}`, e]))
    const matchedKeys = new Set<string>()

    for (const me of melkiorEvents) {
      const key = `${me.date}:${me.name.toLowerCase().trim()}`
      if (baltazarMap.has(key)) {
        allEvents.push({ ...me, venue: 'Les deux' })
        matchedKeys.add(key)
      } else {
        allEvents.push(me)
      }
    }
    for (const be of baltazarEvents) {
      const key = `${be.date}:${be.name.toLowerCase().trim()}`
      if (!matchedKeys.has(key)) {
        allEvents.push(be)
      }
    }

    // Trier par date
    allEvents.sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ events: allEvents })
  } catch (error: any) {
    console.error('Erreur Google Calendar:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
