import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
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
