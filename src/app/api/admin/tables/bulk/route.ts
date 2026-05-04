import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const supabaseAdmin = getSupabaseAdmin('app')
    const { items } = await request.json() as { items: Array<{ venue: string, table_number: number, kind: string, capacity: number }> }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Aucune table à insérer' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('tables')
      .insert(items)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, count: (data?.length ?? items.length) })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
