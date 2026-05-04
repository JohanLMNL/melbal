import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const supabaseAdmin = getSupabaseAdmin('app')
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('tables')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
