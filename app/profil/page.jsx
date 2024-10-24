'use client';
import React, { useEffect, useState } from 'react';
import MenuBar from '../../components/layouts/MenuBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { supabase } from '../../utils/supabase/supabaseClient'; // Assurez-vous que ce chemin est correct

const ProfilePage = () => {
  const [prenom, setPrenom] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // Ajout de messageType pour succès/erreur
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupérer les infos utilisateur à partir du cookie
    const userSession = Cookies.get('userSession');
    if (userSession) {
      const user = JSON.parse(userSession);
      setPrenom(user.prenom); // Pré-remplir le prénom
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Mettre à jour le prénom
      const { data, error } = await supabase
        .from('profiles')
        .update({ prenom })
        .eq('email', JSON.parse(Cookies.get('userSession')).email); // Trouver l'utilisateur via son email

      if (error) {
        throw error;
      }

      // Mettre à jour le cookie avec le nouveau prénom
      const updatedUserSession = JSON.parse(
        Cookies.get('userSession')
      );
      updatedUserSession.prenom = prenom;
      Cookies.set('userSession', JSON.stringify(updatedUserSession), {
        expires: 7,
        path: '/',
        sameSite: 'Lax',
      });

      setMessage('Profil mis à jour avec succès !');
      setMessageType('success'); // Définir messageType sur succès
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil.');
      setMessageType('error'); // Définir messageType sur erreur
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setMessage('Les nouveaux mots de passe ne correspondent pas.');
      setMessageType('error'); // Définir messageType sur erreur
      setLoading(false);
      return;
    }

    try {
      // Changer le mot de passe via Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage('Mot de passe mis à jour avec succès !');
      setMessageType('success'); // Définir messageType sur succès
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du mot de passe.');
      setMessageType('error'); // Définir messageType sur erreur
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MenuBar />
      <div className='mt-6 w-screen flex flex-col items-center justify-center'>
        <h2 className='text-xl font-bold'>Profil de {prenom}</h2>

        {/* Formulaire de mise à jour du prénom */}
        <form
          onSubmit={handleUpdateProfile}
          className='flex flex-col items-center justify-center gap-3 mt-5 w-11/12 md:w-6/12'
        >
          <Label>Prénom</Label>
          <Input
            type='text'
            value={prenom}
            className='w-80'
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
          <Button
            type='submit'
            className='w-80'
            disabled={loading}
          >
            {loading
              ? 'Modification en cours...'
              : 'Modifier le profil'}
          </Button>
        </form>

        {/* Formulaire de changement de mot de passe */}
        <form
          onSubmit={handleChangePassword}
          className='flex flex-col gap-3 mt-5 w-11/12 justify-center items-center md:w-6/12'
        >
          <Label>Ancien Mot de passe</Label>
          <Input
            type='password'
            className='w-80'
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Label>Nouveau Mot de passe</Label>
          <Input
            type='password'
            value={newPassword}
            className='w-80'
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Label>Répéter le Nouveau Mot de passe</Label>
          <Input
            type='password'
            className='w-80'
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          <Button
            type='submit'
            disabled={loading}
            className='w-80'
          >
            {loading
              ? 'Modification en cours...'
              : 'Changer le mot de passe'}
          </Button>
        </form>

        {/* Affichage du message avec la couleur correspondant à success ou error */}
        {message && (
          <p
            className={`mt-4 ${
              messageType === 'success'
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
