'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/supabaseClient';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react'; // Import des icônes

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // État pour gérer la visibilité du mot de passe
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction de validation des champs avant soumission
  const validateInputs = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Veuillez entrer une adresse email valide.');
      return false;
    }

    if (password.length < 4) {
      setError(
        'Le mot de passe doit comporter au moins 6 caractères.'
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    const userSessionCookie = Cookies.get('userSession');

    if (userSessionCookie) {
      const userSession = JSON.parse(userSessionCookie);

      if (userSession.isActive) {
        window.location.href = '/dashboard';
      } else {
        setError(
          "Votre compte est inactif. Veuillez contacter l'administrateur."
        );
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      const { data: session, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setError('Utilisateur ou mot de passe incorrect.');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('prenom, role, isActive, email')
        .eq('email', email)
        .single();

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

      setTimeout(() => {
        if (profile.isActive) {
          window.location.href = '/dashboard';
        } else {
          setError(
            "Votre compte est inactif. Veuillez contacter l'administrateur."
          );
        }
      }, 1000);
    } catch (error) {
      setError("Une erreur s'est produite lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='w-96 p-6 '>
        <h2 className='text-2xl font-bold mb-6'>
          MelBal<span className='font-thin'>App</span>
        </h2>

        <form
          onSubmit={handleLogin}
          className='flex flex-col gap-4'
        >
          <div>
            <Label
              htmlFor='email'
              className='block text-sm font-medium'
            >
              Email
            </Label>
            <Input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
              placeholder='you@example.com'
            />
          </div>

          <div className='relative'>
            <Label
              htmlFor='password'
              className='block text-sm font-medium'
            >
              Mot de passe
            </Label>
            <Input
              type={showPassword ? 'text' : 'password'} // Changer le type selon la visibilité
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1 p-2 block w-full border border-gray-300 rounded-md'
              required
              placeholder='••••••••'
            />
            <button
              type='button'
              className='absolute right-2 top-9 text-gray-600'
              onClick={() => setShowPassword(!showPassword)} // Basculer la visibilité du mot de passe
            >
              {showPassword ? (
                <EyeOffIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}{' '}
              {/* Icônes pour montrer/masquer */}
            </button>
          </div>

          {error && (
            <p className='text-red-500 text-sm mt-2'>{error}</p>
          )}

          <Button
            type='submit'
            className={`mt-4 w-full p-2 text-white rounded-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Connexion'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
