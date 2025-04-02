'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MenuBar from '../../components/layouts/MenuBar';
import AgendaList from '../../components/agenda/AgendaList';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import DatePicker from '../../components/ui/datePicker';
import { CalendarPlus } from 'lucide-react';

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [melkiorActive, setMelkiorActive] = useState(true); // Switch pour Melkior
  const [baltazarActive, setBaltazarActive] = useState(true); // Switch pour Baltazar
  const [userRole, setUserRole] = useState(null); // Rôle de l'utilisateur

  useEffect(() => {
    const cookie = document.cookie;
    console.log('Cookies disponibles :', cookie);

    // Récupérer le cookie nommé `userSession`
    const userCookie = cookie
      .split('; ')
      .find((row) => row.startsWith('userSession='))
      ?.split('=')[1];

    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie)); // Décoder et parser le cookie
        console.log('Données du cookie utilisateur :', user);
        setUserRole(user.role); // Stocker le rôle de l'utilisateur
      } catch (error) {
        console.error('Erreur lors du parsing du cookie :', error);
      }
    } else {
      console.log('Aucun cookie utilisateur trouvé.');
    }
  }, []);

  return (
    <div className='flex flex-col items-center justify-center overflow-x-hidden'>
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg lg:mb-5'>Agenda</h2>
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
              checked={melkiorActive}
              onCheckedChange={(checked) => setMelkiorActive(checked)}
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
              checked={baltazarActive}
              onCheckedChange={(checked) =>
                setBaltazarActive(checked)
              }
            />
          </div>
        </div>
        <Input
          className='w-80'
          type='text'
          placeholder='Recherche par nom...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
        />
        {/* Afficher le bouton uniquement pour admin ou boss */}
        {(userRole === 'admin' || userRole === 'boss') && (
          <Link href='/agenda/nouveau'>
            <Button className='flex items-center justify-center gap-2'>
              Nouvel évènement
              <CalendarPlus
                size={18}
                strokeWidth={1}
              />
            </Button>
          </Link>
        )}
      </div>
      <AgendaList
        searchTerm={searchTerm}
        selectedDate={selectedDate}
        melkiorActive={melkiorActive}
        baltazarActive={baltazarActive}
      />
    </div>
  );
};

export default Page;
