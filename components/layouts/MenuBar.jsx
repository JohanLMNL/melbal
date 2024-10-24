import React from 'react';
import Link from 'next/link';

import { Button } from '../ui/button';

import { Menu, LogOut } from 'lucide-react';

const Header = () => {
  return (
    <div className='w-screen max-w-full h-20 border-b-2 border-zinc-700 flex items-center p-3 justify-between'>
      <Link
        href='/dashboard'
        className='text-xl font-bold'
      >
        MelBal<span className='font-thin'>App</span>
      </Link>
      <div className='flex gap-3'>
        <Link href='/menu'>
          <Button size='icon'>
            <Menu
              size={18}
              strokeWidth={1}
            />
          </Button>
        </Link>
        <Link href='/logout'>
          <Button
            size='icon'
            variant='outline'
          >
            <LogOut
              size={18}
              strokeWidth={1}
            />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Header;
