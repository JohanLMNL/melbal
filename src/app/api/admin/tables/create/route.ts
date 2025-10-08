import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://datjoleofcjcpejnhddd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function POST(request: NextRequest) {
  try {
    const { venue, table_number, kind, capacity } = await request.json()
    if (!venue || !table_number || !kind || !capacity) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Appelle la fonction RPC publique qui agit sur app.tables
    const { data, error } = await supabaseAdmin
      .rpc('create_table', { p_venue: venue, p_table_number: table_number, p_kind: kind, p_capacity: capacity })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, table: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
