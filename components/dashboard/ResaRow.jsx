'use client';
import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getTodayReservationsForSalle } from '../../utils/supabase/reservation';
import { Skeleton } from '@/components/ui/skeleton';

const ResaRow = (props) => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResa, setTotalResa] = useState(0);
  const [totalPersonne, setTotalPersonne] = useState(0);

  useEffect(() => {
    const fetchReservations = async () => {
      const data = await getTodayReservationsForSalle(props.salle);
      setReservations(data);
      setTotalResa(data.length);
      setIsLoading(false);

      const totalNombreSum = data.reduce(
        (sum, reservation) => sum + (reservation.nombre || 0),
        0
      );
      setTotalPersonne(totalNombreSum);
    };

    fetchReservations();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className='p-4 flex items-center gap-3  h-20 rounded-lg border shadow-sm dark:border-zinc-700 dark:bg-transparent dark:text-white w-11/12'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <div className='flex flex-col items-start justify-center gap-2'>
            <Skeleton className='h-3 w-[150px]' />
            <Skeleton className='h-2 w-[70px]' />
          </div>
        </div>
      ) : (
        <div className='p-4 flex items-center gap-3 h-20 rounded-lg border shadow-sm dark:border-zinc-700 dark:bg-transparent dark:text-white w-11/12'>
          <Image
            src={props.logo}
            width={24}
            height={24}
            alt={props.alt}
          />
          <div className='flex flex-col items-start justify-center'>
            {totalResa === 0 ? (
              <p className='text-lg font-bold'>Aucune Réservations</p>
            ) : (
              <p className='text-lg font-bold'>
                {totalResa} Réservation{totalResa > 1 ? 's' : ''}
              </p>
            )}
            {totalResa !== 0 && (
              <p className='text-sm font-thin text-slate-400 '>
                {totalPersonne} Personnes
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResaRow;
