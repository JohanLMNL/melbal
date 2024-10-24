'use client';
import React from 'react';
import MenuBar from '../../components/layouts/MenuBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, TriangleAlert, LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import logout from '../../utils/logout';

const page = () => {
  return (
    <div>
      <MenuBar />
      <div className='mt-2'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <h2 className='mt-2 font-bold text-lg'>Déconnexion</h2>
        </div>
        <div className='flex flex-col items-center justify-center gap-1 mb-5'>
          <TriangleAlert
            size={24}
            strokeWidth={1}
          />
          <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </div>
        <div className='flex items-center justify-center gap-2'>
          <Link href='/dashboard'>
            <Button className='w-36 flex items-center justify-center gap-1'>
              <ChevronLeft
                size={18}
                strokeWidth={1}
              />{' '}
              Dashboard
            </Button>
          </Link>
          <Button
            variant={'destructive'}
            onClick={logout}
            className='w-36 flex items-center justify-center gap-1'
          >
            Déconnexion
            <LogOutIcon
              size={24}
              strokeWidth={1}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
