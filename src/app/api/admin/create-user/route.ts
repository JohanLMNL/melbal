import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = 'https://datjoleofcjcpejnhddd.supabase.co'
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
    const { password, username, role } = await request.json()

    if (!password || !username || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Créer l'email technique basé sur le username pour correspondre au système de connexion
    const technicalEmail = `${username}21@gmail.com`
    
    console.log('Tentative de création utilisateur:', { technicalEmail, username, role })
    
    // Utiliser signUp normal puis confirmer l'email automatiquement
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email: technicalEmail,
      password,
      options: {
        data: {
          username,
          role
        }
      }
    })
    
    console.log('Résultat signUp:', { authData, authError })
    
    if (authError) {
      console.error('Erreur lors de la création:', authError)
      return NextResponse.json(
        { error: `Erreur de création: ${authError.message}` },
        { status: 400 }
      )
    }

    // Confirmer automatiquement l'email après création
    if (authData.user) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      )
      
      if (confirmError) {
        console.warn('Erreur confirmation email:', confirmError.message)
      }
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
