import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client admin avec service_role key pour créer des utilisateurs
const supabaseAdmin = createClient(
  'https://datjoleofcjcpejnhddd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdGpvbGVvZmNqY3Blam5oZGRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYzODQ1MCwiZXhwIjoyMDcxMjE0NDUwfQ.8_FJzSzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQzQ',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Tentative de création utilisateur admin...')
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erreur lors de la vérification des utilisateurs:', listError)
      return NextResponse.json({ 
        error: 'Erreur de vérification utilisateurs', 
        details: listError.message 
      }, { status: 400 })
    }

    const existingUser = existingUsers.users.find(u => u.email === 'johan@app.local')
    
    if (existingUser) {
      console.log('✅ Utilisateur johan existe déjà')
      return NextResponse.json({ 
        success: true, 
        user_id: existingUser.id,
        message: 'Utilisateur johan existe déjà - vous pouvez vous connecter'
      })
    }

    // Créer l'utilisateur admin
    console.log('👤 Création de l\'utilisateur johan...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'johan@app.local',
      password: 'ChangeMe!123',
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Erreur création utilisateur:', authError)
      return NextResponse.json({ 
        error: 'Erreur création utilisateur', 
        details: authError.message 
      }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Échec de création utilisateur' }, { status: 400 })
    }

    console.log('✅ Utilisateur créé:', authData.user.id)

    // Créer le profil admin directement dans la table
    console.log('📝 Création du profil admin...')
    const { error: profileError } = await supabaseAdmin
      .from('app.profiles')
      .insert({
        id: authData.user.id,
        username: 'Johan',
        role: 'admin'
      })

    if (profileError) {
      console.error('❌ Erreur création profil:', profileError)
      return NextResponse.json({ 
        error: 'Erreur création profil', 
        details: profileError.message 
      }, { status: 400 })
    }

    console.log('✅ Profil admin créé avec succès')

    return NextResponse.json({ 
      success: true, 
      user_id: authData.user.id,
      message: 'Compte admin Johan créé avec succès - vous pouvez vous connecter avec le pseudo "johan"'
    })

  } catch (error) {
    console.error('💥 Erreur serveur:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 })
  }
}
