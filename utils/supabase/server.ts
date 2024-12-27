import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  // Résolution de la promesse retournée par cookies()
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Récupération de tous les cookies
        async getAll() {
          return cookieStore.getAll();
        },
        // Définition de plusieurs cookies
        async setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              // Utilisation de la méthode set avec await
              await cookieStore.set(name, value, options);
            }
          } catch (error) {
            console.warn(
              "Error setting cookies. This may occur if 'set' is used in a restricted context.",
              error
            );
          }
        },
      },
    }
  );
};
