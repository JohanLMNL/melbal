import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://datjoleofcjcpejnhddd.supabase.co'

/**
 * Crée un client Supabase admin (service_role).
 * À utiliser uniquement côté serveur dans les API routes.
 */
export function getSupabaseAdmin(schema: 'public' | 'app' = 'public') {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema }
  })
}

/**
 * Vérifie que la requête provient d'un utilisateur authentifié
 * et retourne son profil. Vérifie optionnellement le rôle.
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ userId: string; role: string } | NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  // Créer un client avec le token de l'utilisateur pour vérifier son identité
  const supabaseUser = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdGpvbGVvZmNqY3Blam5oZGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg0NTAsImV4cCI6MjA3MTIxNDQ1MH0.U_vEAveaOpGOuH_d1u3KmefEWdw2yF6Ak4WQ29z2_RY', {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: { user }, error } = await supabaseUser.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }

  // Récupérer le profil pour vérifier le rôle
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as string) || (user.user_metadata?.role as string) || 'porter'

  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  return { userId: user.id, role }
}

/**
 * Vérifie que l'appelant est admin ou boss
 */
export async function requireAdmin(request: NextRequest) {
  return requireAuth(request, ['admin', 'boss'])
}
