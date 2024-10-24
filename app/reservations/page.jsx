'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import MenuBar from '../../components/layouts/MenuBar';
import ResaList from '../../components/reservations/ResaList';
import Link from 'next/link';
import { handlePrint } from '../../utils/pdfGenerator';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import DatePicker from '../../components/ui/datePicker';
import { PlusIcon, PrinterIcon, ChevronLeftIcon } from 'lucide-react';

const Reservations = () => {
  const [isMounted, setIsMounted] = useState(false); // Nouveau state pour vérifier si le composant est monté
  const [dateDeTri, setDateDeTri] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [melkior, setMelkior] = useState(true);
  const [baltazar, setBaltazar] = useState(true);

  // Utiliser useEffect pour vérifier si le composant est monté
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDateChange = useCallback((date) => {
    setDateDeTri(date);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Protéger le rendu des éléments dynamiques jusqu'à ce que le composant soit monté
  if (!isMounted) {
    return null; // Ne rien rendre tant que le composant n'est pas monté côté client
  }

  return (
    <div className='flex flex-col items-center justify-center overflow-x-hidden'>
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg lg:mb-5'>Réservations</h2>
      <div className='flex flex-col items-center justify-center gap-3 mt-2 lg:flex-row'>
        <div className='flex items-center justify-center gap-8'>
          <div className='flex flex-col items-center justify-center gap-2 lg:flex-row'>
            <Image
              src='/logos/LogoMel.svg'
              width={24}
              height={24}
              alt='Logo Melkior' // Ajout d'une alt pour éviter un avertissement
            />
            <Switch
              checked={melkior}
              onCheckedChange={(checked) => setMelkior(checked)}
            />
          </div>
          <div className='flex flex-col items-center justify-center gap-2 lg:flex-row'>
            <Image
              src='/logos/LogoBal.svg'
              width={15}
              height={15}
              alt='Logo Baltazar' // Ajout d'une alt pour éviter un avertissement
            />
            <Switch
              checked={baltazar}
              onCheckedChange={(checked) => setBaltazar(checked)}
            />
          </div>
        </div>
        <Input
          className='w-80'
          type='text'
          placeholder='Recherche par nom...'
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <DatePicker
          className='lg:h-10'
          selectedDate={dateDeTri}
          onDateChange={handleDateChange}
        />
        <Link href='/reservations/nouvelleReservation'>
          <Button className='flex items-center justify-center gap-2'>
            Nouvelle Réservation
            <PlusIcon
              size={18}
              strokeWidth={1}
            />
          </Button>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger>
            <Button
              variant='outline'
              className='flex items-center justify-center gap-2 w-48'
            >
              Imprimer
              <PrinterIcon
                size={18}
                strokeWidth={1}
              />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Imprimer</AlertDialogTitle>
              <AlertDialogDescription>
                Pour quelle salle souhaitez-vous imprimer les
                réservations ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Button
                  variant={'outline'}
                  className='w-28 h-9'
                >
                  <ChevronLeftIcon
                    size={18}
                    strokeWidth={1}
                  />
                  Retour
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handlePrint('melkior')}
              >
                <Button className='w-28 h-9'>Melkior</Button>
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => handlePrint('baltazar')}
              >
                <Button className='w-28 h-9'>Bal'tazar</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div>
        <ResaList
          dateDeTri={dateDeTri}
          searchTerm={searchTerm}
          melkior={melkior}
          baltazar={baltazar}
        />
      </div>
    </div>
  );
};

export default Reservations;
