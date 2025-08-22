import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client admin avec la clé de service
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { pseudo } = await request.json()

    if (!pseudo) {
      return NextResponse.json(
        { error: 'Pseudo requis' },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur par pseudo dans les métadonnées
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Erreur lors de la recherche utilisateur:', error)
      return NextResponse.json(
        { error: 'Erreur de recherche' },
        { status: 500 }
      )
    }

    const user = users.find(u => u.user_metadata?.username === pseudo)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      email: user.email
    })

  } catch (error) {
    console.error('Erreur API get-email-by-pseudo:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
