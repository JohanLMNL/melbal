import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const supabaseAdmin = getSupabaseAdmin('app')
    const { id, venue, table_number, kind, capacity } = await request.json()
    if (!id || !venue || !table_number || !kind || !capacity) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('tables')
      .update({ venue, table_number, kind, capacity })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, table: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
