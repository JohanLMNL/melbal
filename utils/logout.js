import { supabase } from './supabase/supabaseClient';
import Cookies from 'js-cookie';

const logout = async () => {
  // Déconnecter l'utilisateur de Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Erreur lors de la déconnexion:', error.message);
    return;
  }

  // Supprimer le cookie personnalisé
  Cookies.remove('userSession');

  // Rediriger vers la page de login après déconnexion
  window.location.href = '/login';
};

export default logout;
