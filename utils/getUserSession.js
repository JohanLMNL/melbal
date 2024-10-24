import Cookies from 'js-cookie';
import cookie from 'cookie'; // Utilitaire pour parser les cookies côté serveur

const getUserSession = (req = null) => {
  // Côté serveur (avec req.cookies)
  if (req) {
    console.log('Cookies reçus côté serveur:', req.headers.cookie); // Ajouter un log pour vérifier les cookies

    const cookies = cookie.parse(req.headers.cookie || ''); // Parser les cookies de la requête
    const userSessionCookie = cookies.userSession;

    if (userSessionCookie) {
      try {
        return JSON.parse(decodeURIComponent(userSessionCookie));
      } catch (error) {
        console.error(
          'Erreur lors de la désérialisation du cookie serveur:',
          error
        );
        return null;
      }
    }

    console.log('Aucun cookie trouvé côté serveur');
    return null;
  }

  // Côté client (avec document.cookie)
  if (typeof window !== 'undefined') {
    const userSessionCookie = Cookies.get('userSession');

    if (userSessionCookie) {
      try {
        return JSON.parse(userSessionCookie);
      } catch (error) {
        console.error(
          'Erreur lors de la désérialisation du cookie côté client:',
          error
        );
        return null;
      }
    }

    console.log('Aucun cookie trouvé côté client');
    return null;
  }

  console.log('Aucun cookie trouvé');
  return null;
};

export default getUserSession;
