import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/login');
  };

  return (
    <form action={signOut}>
      <Button
        variant='destructive'
        className='flex gap-1 items-center justify-center w-36'
      >
        <p>Déconnexion </p>
        <LogOut
          size={18}
          strokeWidth={1}
        />
      </Button>
    </form>
  );
}
