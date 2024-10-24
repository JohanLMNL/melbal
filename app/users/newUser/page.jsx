'use client';
import { useState } from 'react';
import { signUpUserWithProfile } from '../../../utils/supabase/users/userFunction';

import MenuBar from '@/components/layouts/MenuBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';

import { UserPlusIcon } from 'lucide-react';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('melbal');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState('serveur');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Appel de la fonction signUpUserWithProfile pour créer un utilisateur et son profil
    const { error, user } = await signUpUserWithProfile(
      email,
      password,
      prenom,
      role
    );

    if (error) {
      setError(error); // Afficher l'erreur si quelque chose ne va pas
    } else {
      setSuccessMessage(
        'Inscription réussie ! Redirection en cours...'
      );

      // Redirection vers /users après un délai de 2 secondes
      setTimeout(() => {
        window.location.href = '/users'; // Utilisation de window.location.href pour la redirection
      }, 2000); // Délai de 2 secondes pour permettre l'affichage du message
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg mb-5'>
        Nouvel utilisateur
      </h2>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col items-center justify-center gap-2'
      >
        <div>
          <Label>Prénom :</Label>
          <Input
            type='text'
            className='w-80'
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Email :</Label>
          <Input
            type='email'
            className='w-80'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Rôle :</Label>
          <Select
            onValueChange={setRole}
            value={role}
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

        <Button
          type='submit'
          className='mt-4 flex gap-2 items-center justify-center'
        >
          Inscrire{' '}
          <UserPlusIcon
            size={18}
            strokeWidth={1}
          />
        </Button>
      </form>

      {/* Affichage des messages d'erreur ou de succès */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && (
        <p style={{ color: 'green' }}>{successMessage}</p>
      )}
    </div>
  );
};

export default SignUpPage;
