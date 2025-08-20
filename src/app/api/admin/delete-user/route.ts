import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client admin avec service_role key pour supprimer des utilisateurs
const supabaseAdmin = createClient(
  'https://datjoleofcjcpejnhddd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    // Supprimer l'utilisateur de l'authentification Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Erreur suppression auth:', authError)
      return NextResponse.json({ 
        error: 'Erreur de suppression utilisateur', 
        details: authError.message 
      }, { status: 400 })
    }

    // Le profil sera automatiquement supprimé par la cascade de suppression
    // ou par un trigger de base de données

    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur supprimé avec succès' 
    })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 })
  }
}
