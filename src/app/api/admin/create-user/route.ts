import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { password, username, role } = await request.json()

    if (!password || !username || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Créer l'email technique basé sur le username pour correspondre au système de connexion
    // Nettoyer le username pour créer un email valide (enlever espaces, caractères spéciaux)
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
    const technicalEmail = `${cleanUsername}21@gmail.com`
    
    console.log('Tentative de création utilisateur:', { technicalEmail, username, role })
    
    // Vérification configuration ENV côté serveur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://datjoleofcjcpejnhddd.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('ENV check:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl?.slice(0, 30) + '...'
    })
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Configuration manquante: NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      )
    }

    // Client admin avec la clé de service (créé à l'intérieur pour éviter les crashs au chargement)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Utiliser l'API admin createUser qui permet de créer sans validation d'email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: technicalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role
      }
    })
    
    console.log('Résultat createUser:', { authData, authError })
    
    if (authError) {
      console.error('Erreur lors de la création:', authError)
      return NextResponse.json(
        { error: `Erreur de création: ${authError.message}` },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Créer le profil dans la table profiles (schéma app) via fonction SQL
      const { error: profileError } = await supabaseAdmin
        .rpc('create_user_profile', {
          user_id: authData.user.id,
          user_username: username,
          user_role: role
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

