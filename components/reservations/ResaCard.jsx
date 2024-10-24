import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Image from 'next/image';
import {
  toShortDate,
  toShortTime,
} from '@/utils/transformDateandHour';

const ResaCard = (props) => {
  return (
    <div>
      <Card className='bg-transparent flex w-96 h-28'>
        <CardContent className=' w-96 h-28 flex items-center justify-between p-5'>
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
              {props.nom}
            </div>
            <div
              className='font-thin
              text-sm'
            >
              {props.nombre} Personnes
            </div>
          </div>
          <div className='flex flex-col items-center gap-2'>
            {props.acompte !== 0 &&
              props.acompte !== null &&
              props.acompte !== '' &&
              props.acompte !== '0' && (
                <div className='text-sm h-10 w-10 bg-transparent rounded border-2 border-zinc-800 flex items-center justify-center font-bold'>
                  {props.acompte}€
                </div>
              )}

            <div className='h-10 w-10 bg-zinc-200 rounded border-2 border-zinc-800 text-zinc-800 font-bold flex items-center justify-center'>
              {props.table != null ? props.table : '-'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResaCard;
