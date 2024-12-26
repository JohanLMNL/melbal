import React from 'react';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  toShortDate,
  toShortTime,
} from '@/utils/transformDateandHour';

const ResaCard = (props) => {
  console.log('Props:', props);

  // Fonction pour vérifier si la table inclut au moins un élément de la liste
  const includesAnyTable = (table, list) => {
    const tableArray = table.split(',').map((item) => item.trim());
    return tableArray.some((item) => list.includes(item));
  };

  const displayTable = props.table
    ? props.table.length > 2
      ? `${props.table.slice(0, 2)}...`
      : props.table
    : '-';

  const isGoldenCase =
    props.salle === 'baltazar' &&
    includesAnyTable(props.table, ['VIP', '11', '12', '13', '14']);

  const isBlueCase =
    props.salle === 'baltazar' &&
    includesAnyTable(props.table, ['A', 'B', 'C', 'D', 'E']);

  let cardClasses = `bg-transparent flex w-96 h-28 !border-2 !border-zinc-800 relative`;

  if (isGoldenCase) {
    cardClasses = `bg-transparent flex w-96 h-28 !border-3 !border-amber-200 relative`;
  } else if (isBlueCase) {
    cardClasses = `bg-transparent flex w-96 h-28 !border-3 !border-blue-200`;
  }

  // Composant d'étoiles avec animation
  const StarAnimation = () => {
    const stars = [...Array(15)]; // 15 étoiles
    return (
      <div className='absolute inset-0 overflow-hidden z-0 pointer-events-none'>
        {stars.map((_, index) => (
          <motion.div
            key={index}
            className='absolute bg-yellow-300 rounded-full'
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
              x: Math.random() * 300 - 150, // Position X aléatoire
              y: Math.random() * 100 - 50, // Position Y aléatoire
            }}
            transition={{
              duration: Math.random() * 2 + 1, // Durée aléatoire
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: `${Math.random() * 6 + 4}px`, // Taille aléatoire
              height: `${Math.random() * 6 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <Card className={cardClasses}>
        {isGoldenCase && <StarAnimation />}{' '}
        {/* Affiche les étoiles */}
        <CardContent className='w-96 h-28 flex items-center justify-between p-5 relative z-10'>
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
            <div className='font-thin text-sm'>
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
              {displayTable}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResaCard;
