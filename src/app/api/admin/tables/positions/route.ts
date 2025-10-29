import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items = (body?.items ?? []) as Array<{ id: number, pos_x: number, pos_y: number }>
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items requis' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://datjoleofcjcpejnhddd.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Validate range and coerce
    const payload = items.map((it) => {
      const x = Math.max(0, Math.min(100, Number(it.pos_x)))
      const y = Math.max(0, Math.min(100, Number(it.pos_y)))
      if (Number.isNaN(x) || Number.isNaN(y) || typeof it.id !== 'number') {
        throw new Error('Valeurs invalides dans items')
      }
      return { id: it.id, pos_x: x, pos_y: y }
    })

    // Call RPC in public schema to update positions
    const { data, error } = await admin.rpc('update_table_positions', { items: payload as any })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const count = typeof data === 'number' ? data : payload.length
    return NextResponse.json({ success: true, count })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur interne du serveur' }, { status: 500 })
  }
}
