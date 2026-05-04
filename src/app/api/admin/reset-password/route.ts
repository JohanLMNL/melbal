import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const supabaseAdmin = getSupabaseAdmin()
    const { pseudo, newPassword } = await request.json()

    if (!pseudo || !newPassword) {
      return NextResponse.json({ error: 'Pseudo et nouveau mot de passe requis' }, { status: 400 })
    }

    // Email technique utilisé par l’app pour la connexion
    const email = `${pseudo}21@gmail.com`

    // Chercher l’utilisateur via Admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) {
      return NextResponse.json({ error: 'Erreur de recherche utilisateur' }, { status: 500 })
    }

    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() || u.user_metadata?.username === pseudo
    )

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      return NextResponse.json({ error: `Erreur de mise à jour: ${updateError.message}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
