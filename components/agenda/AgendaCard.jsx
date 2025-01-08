import React from 'react';
import Image from 'next/image';

import {
  toShortDate,
  toShortTime,
} from '@/utils/transformDateandHour';

import { Card, CardContent } from '../ui/card';

const AgendaCard = (props) => {
  return (
    <div>
      <Card>
        <CardContent className='w-96 h-28 flex flex-col items-center justify-center p-5 relative z-10'>
          <div className='flex flex-col items-center gap-2'>
            <div className='h-10 w-10 bg-transparent rounded flex items-center justify-center'>
              {props.salle === 'melkior' ? (
                <Image
                  className='fill-zinc-800 color-zinc-800'
                  src='/logos/LogoMel.svg'
                  width={24}
                  height={24}
                  alt='Logo Melkior'
                />
              ) : (
                <Image
                  src='/logos/LogoBal.svg'
                  width={18}
                  height={18}
                  alt='Logo Balta'
                />
              )}
            </div>
          </div>

          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='font-thin text-sm'>
              {toShortDate(props.date)}
              {toShortTime(props.heure) !== '' &&
                ' - ' + toShortTime(props.heure)}
            </div>
            <div className='text-lg font-bold uppercase'>
              {props.evenement}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaCard;
