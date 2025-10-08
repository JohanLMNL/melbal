import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { venue } = await request.json().catch(() => ({ })) as { venue?: string }

    // Vérifier ENV et créer le client à l'intérieur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://datjoleofcjcpejnhddd.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Configuration manquante: NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // RPC à créer côté DB: public.get_tables(venue text DEFAULT NULL)
    const { data, error } = await supabaseAdmin
      .rpc('get_tables', { p_venue: venue ?? null })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, tables: data })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

