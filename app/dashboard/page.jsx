'use client'; // Spécifie que c'est un composant côté client
import React, { useEffect, useState } from 'react';
import MenuBar from '@/components/layouts/MenuBar';
import ResaCard from '../../components/dashboard/ResaCard';
import Cookies from 'js-cookie'; // Importer js-cookie pour accéder au cookie

const Dashboard = () => {
  const [prenom, setPrenom] = useState('');

  useEffect(() => {
    // Récupérer le cookie 'userSession'
    const userSession = Cookies.get('userSession');
    if (userSession) {
      try {
        const parsedSession = JSON.parse(userSession);
        setPrenom(parsedSession.prenom); // Mettre à jour le prénom de l'utilisateur
      } catch (error) {
        console.error('Erreur de parsing du cookie:', error);
      }
    }
  }, []);

  return (
    <div>
      <MenuBar />
      <div className='mt-6 w-screen flex flex-col items-center justify-center'>
        {prenom && (
          <h2 className='text-xl font-bold mb-4'>
            Bonjour {prenom} !
          </h2>
        )}
        <ResaCard />
      </div>
    </div>
  );
};

export default Dashboard;
