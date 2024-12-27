'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
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
import Cookies from 'js-cookie';

const Reservations = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [dateDeTri, setDateDeTri] = useState(null); // Utilisation de null par défaut
  const [searchTerm, setSearchTerm] = useState(''); // Chaîne vide par défaut
  const [melkior, setMelkior] = useState(true);
  const [baltazar, setBaltazar] = useState(true);

  // Initialisation lors du montage
  useEffect(() => {
    setIsMounted(true);

    // Lire la date depuis le cookie lors du montage
    const savedDate = Cookies.get('selectedReservationDate');
    if (savedDate) {
      const parsedDate = new Date(savedDate);
      if (!isNaN(parsedDate.getTime())) {
        setDateDeTri(parsedDate);
      } else {
        console.warn('Invalid date format in savedDate:', savedDate);
      }
      Cookies.remove('selectedReservationDate');
    }
  }, []);

  // Gestion des messages toast
  useEffect(() => {
    const toastMessage = localStorage.getItem('toastMessage');
    if (toastMessage) {
      if (toastMessage === 'success') {
        toast.success('Réservation ajoutée avec succès !');
      } else if (toastMessage === 'error') {
        toast.error(
          'Une erreur est survenue lors de la réservation.'
        );
      }
      localStorage.removeItem('toastMessage');
    }
  }, []);

  const handleDateChange = useCallback((date) => {
    setDateDeTri(date || null); // Utilisation de null si la date est vide
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value || ''); // Chaîne vide par défaut
  }, []);

  const safeHandlePrint = useCallback((value) => {
    if (!value || typeof value !== 'string') {
      console.error('Invalid value passed to handlePrint:', value);
      return;
    }
    handlePrint(value);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-center overflow-x-hidden'>
      <ToastContainer
        position='top-right'
        autoClose={3000}
      />
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg lg:mb-5'>Réservations</h2>
      <div className='flex flex-col items-center justify-center gap-3 mt-2 lg:flex-row'>
        <div className='flex items-center justify-center gap-8'>
          <div className='flex flex-col items-center justify-center gap-2 lg:flex-row'>
            <Image
              src='/logos/LogoMel.svg'
              width={24}
              height={24}
              alt='Logo Melkior'
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
              alt='Logo Baltazar'
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
          value={searchTerm || ''}
          onChange={handleSearchChange}
        />
        <DatePicker
          className='lg:h-10'
          selectedDate={dateDeTri || null}
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
          <AlertDialogTrigger asChild>
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
                  variant='outline'
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
                onClick={() => safeHandlePrint('melkior')}
              >
                <Button className='w-28 h-9'>Melkior</Button>
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => safeHandlePrint('baltazar')}
              >
                <Button className='w-28 h-9'>Bal'tazar</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div>
        <ResaList
          dateDeTri={dateDeTri || new Date()}
          searchTerm={searchTerm || ''}
          melkior={melkior}
          baltazar={baltazar}
        />
      </div>
    </div>
  );
};

export default Reservations;
