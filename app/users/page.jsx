'use client';
import React, { useEffect, useState } from 'react';
import MenuBar from '../../components/layouts/MenuBar';
import UserRow from '../../components/users/UserRow';
import { supabase } from '../../utils/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { UserPlusIcon } from 'lucide-react';
import Link from 'next/link';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les utilisateurs depuis la table 'profiles'
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('prenom, role, email, isActive, id'); // Assurez-vous que les colonnes existent

      if (error) {
        console.error(
          'Erreur lors de la récupération des utilisateurs :',
          error
        );
      } else {
        setUsers(data); // Mettre à jour l'état avec les données des utilisateurs
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <MenuBar />
      <div className='flex flex-col justify-center items-center'>
        <h2 className='mt-2 font-bold text-lg mb-5'>Utilisateurs</h2>
        <Link href='/users/newUser'>
          <Button className='mb-3 flex items-center justify-center'>
            Nouvel Utilisateur{'  '}
            <UserPlusIcon
              size={18}
              strokeWidth={1}
            />
          </Button>
        </Link>

        {loading ? (
          <p>Chargement des utilisateurs...</p>
        ) : (
          users.map((user) => (
            <UserRow
              key={user.id}
              prenom={user.prenom}
              role={user.role}
              mail={user.email}
              isActive={user.isActive}
              id={user.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UsersPage;
