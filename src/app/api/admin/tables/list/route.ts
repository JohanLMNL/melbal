import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getSupabaseAdmin } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth

    const { venue } = await request.json().catch(() => ({ })) as { venue?: string }

    const supabaseAdmin = getSupabaseAdmin('app')

    let query = supabaseAdmin
      .from('tables')
      .select('*')
      .order('table_number', { ascending: true })

    if (venue) {
      query = query.eq('venue', venue)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, tables: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

