'use client';
import React, { useEffect, useState } from 'react';
import MenuBar from '@/components/layouts/MenuBar';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Button } from '../../components/ui/button';
import {
  BookMarked,
  HouseIcon,
  UserPenIcon,
  UsersIcon,
} from 'lucide-react';

const MenuPage = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    // Récupérer le rôle depuis le cookie userSession
    const userSession = Cookies.get('userSession');
    if (userSession) {
      const parsedSession = JSON.parse(userSession);
      setRole(parsedSession.role); // Mettre à jour l'état avec le rôle de l'utilisateur
    }
  }, []);

  return (
    <div>
      <MenuBar />
      <div className='flex items-center justify-center mb-5'>
        <h2 className='mt-2 font-bold text-lg'>Menu</h2>
      </div>
      <div className='flex gap-3 items-center justify-center'>
        <div className='flex gap-1 flex-col items-center justify-center'>
          <Link href='/dashboard'>
            <Button size='icon'>
              <HouseIcon
                size={24}
                strokeWidth={1}
              />
            </Button>
          </Link>
          <p>dashboard</p>
        </div>
        <div className='flex gap-1 flex-col items-center justify-center'>
          <Link href='/reservations'>
            <Button size='icon'>
              <BookMarked
                size={24}
                strokeWidth={1}
              />
            </Button>
          </Link>
          <p>Réservations</p>
        </div>
        <div className='flex gap-1 flex-col items-center justify-center'>
          <Link href='/profil'>
            <Button size='icon'>
              <UserPenIcon
                size={24}
                strokeWidth={1}
              />
            </Button>
          </Link>
          <p>Profil</p>
        </div>

        {/* Afficher le bouton Utilisateurs uniquement pour les rôles 'admin' ou 'boss' */}
        {(role === 'admin' || role === 'boss') && (
          <div className='flex gap-1 flex-col items-center justify-center'>
            <Link href='/users'>
              <Button size='icon'>
                <UsersIcon
                  size={24}
                  strokeWidth={1}
                />
              </Button>
            </Link>
            <p>Utilisateurs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
