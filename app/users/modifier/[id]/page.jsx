'use client';
import React, { useEffect, useState } from 'react';
import MenuBar from '@/components/layouts/MenuBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import { supabase } from '@/utils/supabase/supabaseClient';
import { ChevronLeftIcon, UserPenIcon } from 'lucide-react';
import Link from 'next/link';

const UserEditPage = () => {
  const [prenom, setPrenom] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null); // Pour gérer les erreurs de validation

  // Fonction pour extraire l'ID à partir de l'URL
  const getUserIdFromURL = () => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      return pathParts[pathParts.length - 1]; // Récupère l'ID qui est à la fin de l'URL
    }
    return null;
  };

  // Récupérer les informations de l'utilisateur via son ID
  useEffect(() => {
    const id = getUserIdFromURL();

    if (id) {
      const fetchUserData = async () => {
        setLoading(true);

        // Récupérer les infos du profil utilisateur depuis la table 'profiles'
        const { data: profileData, error: profileError } =
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError) {
          console.error(
            'Erreur lors de la récupération du profil:',
            profileError
          );
        }

        // Si les données sont récupérées avec succès, remplir les états
        if (profileData) {
          setPrenom(profileData.prenom);
          setIsActive(profileData.isActive);
          setRole(profileData.role);
        }

        setLoading(false);
      };

      fetchUserData();
    }
  }, []);

  // Fonction de mise à jour dans la BDD (sans la modification de l'email)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage(null); // Réinitialiser le message
    setError(null); // Réinitialiser les erreurs

    // Vérification pour protéger les admins contre les modifications
    if (role === 'admin') {
      setError(
        'Les utilisateurs avec le rôle "admin" ne peuvent pas être modifiés.'
      );
      return; // Bloquer l'envoi si l'utilisateur est un admin
    }

    // Validation des champs
    if (!prenom || !role) {
      setError('Tous les champs doivent être remplis.');
      return; // Bloquer l'envoi si un champ est vide
    }

    const id = getUserIdFromURL(); // Récupérer l'ID de l'utilisateur

    try {
      // Mettre à jour les infos dans la table 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          prenom,
          isActive,
          role,
        })
        .eq('id', id);

      if (profileError) {
        console.error(
          'Erreur lors de la mise à jour du profil:',
          profileError
        );
        throw new Error('Erreur lors de la mise à jour du profil.');
      }

      setMessage('Modification réussie !');

      // Rediriger vers /users après un court délai pour afficher le message de succès
      setTimeout(() => {
        window.location.href = '/users'; // Redirection vers /users
      }, 2000); // Délai de 2 secondes pour permettre à l'utilisateur de voir le message de succès
    } catch (error) {
      console.error('Erreur:', error.message);
      setMessage(error.message); // Afficher un message d'erreur
    }
  };

  return (
    <div>
      <MenuBar />
      <div className='flex flex-col items-center justify-center'>
        <h2 className='mt-2 font-bold text-lg mb-5'>
          Modifier {prenom}
        </h2>

        {loading ? (
          <p>Chargement des informations...</p>
        ) : (
          <form
            className='flex flex-col gap-2'
            onSubmit={handleUpdate}
          >
            <div>
              <Label>Prénom :</Label>
              <Input
                className='w-80'
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Statut :</Label>
              <div className='flex items-center justify-center gap-6'>
                <p>Inactif</p>
                <Switch
                  checked={isActive}
                  onCheckedChange={() => setIsActive(!isActive)}
                />
                <p>Actif</p>
              </div>
            </div>

            <div>
              <Label>Rôle :</Label>
              <Select
                className='w-80'
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className='w-80'>
                  <SelectValue placeholder='Rôle' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='boss'>Boss</SelectItem>
                    <SelectItem value='serveur'>Serveur</SelectItem>
                    <SelectItem value='portier'>Portier</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center justify-center gap-5 mt-5'>
              <Link href='/users'>
                <Button
                  className='w-28 flex gap-2 items-center justify-center'
                  variant='outline'
                  type='button'
                >
                  <ChevronLeftIcon
                    size={18}
                    strokeWidth={1}
                  />
                  Retour
                </Button>
              </Link>
              <Button
                type='submit'
                className='flex items-center justify-center gap-2'
              >
                Modifier
                <UserPenIcon
                  size={18}
                  strokeWidth={1}
                />
              </Button>
            </div>
          </form>
        )}

        {/* Affichage des messages d'erreur et de succès */}
        {error && <p className='mt-4 text-red-500'>{error}</p>}
        {message && <p className='mt-4 text-green-500'>{message}</p>}
      </div>
    </div>
  );
};

export default UserEditPage;
