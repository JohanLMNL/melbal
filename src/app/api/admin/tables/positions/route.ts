import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request)
    if (authCheck instanceof NextResponse) return authCheck

    const body = await request.json()
    const items = (body?.items ?? []) as Array<{ id: number, pos_x: number, pos_y: number }>
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items requis' }, { status: 400 })
    }

    const admin = getSupabaseAdmin('app')

    // Validate range and coerce
    const payload = items.map((it) => {
      const x = Math.max(0, Math.min(100, Number(it.pos_x)))
      const y = Math.max(0, Math.min(100, Number(it.pos_y)))
      if (Number.isNaN(x) || Number.isNaN(y) || typeof it.id !== 'number') {
        throw new Error('Valeurs invalides dans items')
      }
      return { id: it.id, pos_x: x, pos_y: y }
    })

    // Update each table position in parallel
    const results = await Promise.all(
      payload.map(({ id, pos_x, pos_y }) =>
        admin.from('tables').update({ pos_x, pos_y }).eq('id', id)
      )
    )
    const firstError = results.find(r => r.error)
    if (firstError?.error) {
      return NextResponse.json({ error: firstError.error.message }, { status: 400 })
    }
    return NextResponse.json({ success: true, count: payload.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}
