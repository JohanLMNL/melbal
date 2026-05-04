import { supabase } from '@/lib/supabase'

/**
 * Fetch authentifié vers les API routes internes.
 * Ajoute automatiquement le Bearer token de l'utilisateur connecté.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
