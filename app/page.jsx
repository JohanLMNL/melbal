'use client';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '../utils/supabase/supabaseClient';

const Home = () => {
  const syncUserSession = async () => {
    // Récupération du cookie actuel
    const userSession = Cookies.get('userSession');

    if (userSession) {
      try {
        // Désérialiser et récupérer l'email de l'utilisateur du cookie
        const parsedSession = JSON.parse(userSession);
        const { email } = parsedSession;

        // Requête à la base de données pour obtenir l'état actuel de l'utilisateur
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('prenom, role, isActive, email')
          .eq('email', email)
          .single();

        if (error || !profile) {
          throw new Error(
            "L'utilisateur n'existe plus ou est inactif."
          );
        }

        // Mise à jour du cookie avec les données actuelles
        Cookies.set(
          'userSession',
          JSON.stringify({
            email: profile.email,
            prenom: profile.prenom,
            role: profile.role,
            isActive: profile.isActive,
          }),
          {
            expires: 7,
            path: '/',
            sameSite: 'Lax',
          }
        );

        // Vérifiez si l'utilisateur est actif pour rediriger
        if (profile.isActive) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error(
          'Erreur lors de la synchronisation du cookie:',
          error
        );
        window.location.href = '/login'; // Redirige en cas d'erreur ou d'absence de données
      }
    } else {
      window.location.href = '/login'; // Redirige si aucun cookie n'existe
    }
  };

  useEffect(() => {
    syncUserSession(); // Synchronisation à chaque chargement
  }, []);

  return (
    <div className='h-full w-full flex item-center justify-center'>
      Redirection en cours...
    </div>
  );
};

export default Home;
