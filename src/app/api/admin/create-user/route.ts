import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getSupabaseAdmin } from '@/lib/api-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { password, username, role } = await request.json()

    if (!password || !username || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
    const technicalEmail = `${cleanUsername}21@gmail.com`

    const supabaseAdmin = getSupabaseAdmin()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: technicalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role
      }
    })
    if (authError) {
      return NextResponse.json(
        { error: `Erreur de création: ${authError.message}` },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Créer le profil dans la table profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          role
        })

      if (profileError) {
        return NextResponse.json(
          { error: `Erreur de création du profil: ${profileError.message}` },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        user: authData.user
      })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

