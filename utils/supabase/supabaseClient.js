import { createClient } from '@supabase/supabase-js';

// Remplace ces valeurs par les tiennes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Créer une instance de Supabase avec la persistance des sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  persistSession: true, // Persister la session côté client avec des cookies
  autoRefreshToken: true, // Rafraîchir automatiquement les tokens de session
});
