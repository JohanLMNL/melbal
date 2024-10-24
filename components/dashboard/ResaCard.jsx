import React from 'react';
import ResaRow from './ResaRow';
import { BookMarked } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Link from 'next/link';

const ResaCard = () => {
  return (
    <div>
      <Link href='/reservations'>
        <Card className='bg-transparent flex flex-col w-96 h-64'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookMarked />
              Réservations
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center gap-2'>
            <ResaRow
              salle='melkior'
              logo='/logos/LogoMel.svg'
              alt='logo melkior'
            />
            <ResaRow
              salle='baltazar'
              logo='/logos/LogoBal.svg'
              alt='logo melkior'
            />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default ResaCard;
