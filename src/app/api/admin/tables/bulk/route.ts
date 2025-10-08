import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://datjoleofcjcpejnhddd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json() as { items: Array<{ venue: string, table_number: number, kind: string, capacity: number }> }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Aucune table à insérer' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .rpc('bulk_create_tables', { p_items: items })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, count: (data?.length ?? items.length) })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
