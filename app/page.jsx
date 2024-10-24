'use client'; // Indique que c'est un composant côté client
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const Home = () => {
  useEffect(() => {
    // Récupérer le cookie 'userSession'
    const userSession = Cookies.get('userSession');

    if (userSession) {
      try {
        // Désérialiser le cookie
        const parsedSession = JSON.parse(userSession);

        // Vérifier si l'utilisateur est actif
        if (parsedSession.isActive) {
          // Rediriger vers '/dashboard' si 'isActive' est true
          window.location.href = '/dashboard';
        } else {
          // Rediriger vers '/login' si 'isActive' est false
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Erreur de parsing du cookie:', error);
        // Rediriger vers '/login' si une erreur de parsing survient
        window.location.href = '/login';
      }
    } else {
      // Rediriger vers '/login' si aucun cookie n'est présent
      window.location.href = '/login';
    }
  }, []);

  // Ajouter un message de chargement pendant la redirection
  return (
    <div className='h-full w-full flex item-center justify-center'>
      Redirection en cours...
    </div>
  );
};

export default Home;
