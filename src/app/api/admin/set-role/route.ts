import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { pseudo, role } = await request.json() as { pseudo: string, role: 'admin' | 'server' | 'porter' | 'boss' }
    if (!pseudo || !role) {
      return NextResponse.json({ error: 'Pseudo et rôle requis' }, { status: 400 })
    }

    const email = `${pseudo}21@gmail.com`
    const supabaseAdmin = getSupabaseAdmin()

    // Trouver l'utilisateur par email technique ou metadata.username
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) return NextResponse.json({ error: 'Erreur de recherche utilisateur' }, { status: 500 })

    const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase() || u.user_metadata?.username === pseudo)
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    // Mettre à jour le metadata de l'utilisateur (username + role) uniquement
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        username: pseudo,
        role,
      }
    })
    if (metaError) return NextResponse.json({ error: `Erreur maj metadata: ${metaError.message}` }, { status: 400 })

    // Ne pas toucher à la table profiles ici pour éviter les soucis de permissions
    return NextResponse.json({ success: true, userId: user.id, role })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

