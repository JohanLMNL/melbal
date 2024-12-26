'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getReservationsByDate } from '../../../utils/supabase/reservation';
import { tablePositionsBySalle } from '../../../utils/tableConfig';
import { IMAGE_REAL_DIMENSIONS } from '../../../utils/imageConstants';
import TableButton from '../../../components/reservations/tableButtons';
import MenuBar from '../../../components/layouts/MenuBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { PlusIcon } from 'lucide-react';
import { addReservation } from '../../../utils/supabase/reservation';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@radix-ui/react-dialog';

const Page = () => {
  const router = useRouter();
  const planRef = useRef(null);
  const [planDimensions, setPlanDimensions] = useState({
    displayedWidth: 0,
    displayedHeight: 0,
  });
  const { width: IMAGE_REAL_WIDTH, height: IMAGE_REAL_HEIGHT } =
    IMAGE_REAL_DIMENSIONS;

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    salle: '',
    nom: '',
    tel: '',
    nombre: '',
    date: today,
    heure: null,
    commentaire: '',
    acompte: '',
    table: '',
    AddBy: '',
  });

  const [reservations, setReservations] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (planRef.current) {
        const rect = planRef.current.getBoundingClientRect();
        setPlanDimensions({
          displayedWidth: rect.width,
          displayedHeight: rect.height,
        });
      }
    };

    // Initialise les dimensions
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchReservationsForDate = async () => {
      if (!formData.date) return; // Si la date n'est pas définie, ne rien faire

      try {
        const data = await getReservationsByDate(formData.date);
        setReservations(data); // Mettre à jour l'état avec les données récupérées
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des réservations :',
          error
        );
      }
    };

    // Réinitialiser formData.table
    setFormData((prevData) => ({
      ...prevData,
      table: '', // Réinitialiser la table
    }));

    fetchReservationsForDate();
  }, [formData.date]); // Exécuter cet effet à chaque changement de formData.date

  const getOccupiedTables = (reservations, salle) => {
    const occupied = new Set();
    reservations
      .filter((resa) => resa.salle === salle) // Filtre les réservations pour la salle sélectionnée
      .forEach((resa) => {
        if (resa.table) {
          const tables = resa.table.split(','); // Si plusieurs tables sont utilisées, elles sont séparées par des virgules
          tables.forEach((table) => occupied.add(table.trim()));
        }
      });
    return occupied;
  };

  const occupiedTables = useMemo(() => {
    const occupied = new Set();
    reservations
      .filter((resa) => resa.salle === formData.salle) // Filtre les réservations pour la salle sélectionnée
      .forEach((resa) => {
        if (resa.table) {
          const tables = resa.table.split(','); // Si plusieurs tables sont utilisées, elles sont séparées par des virgules
          tables.forEach((table) => occupied.add(table.trim()));
        }
      });
    return occupied;
  }, [reservations, formData.salle]);

  const handleImageLoad = () => {
    if (planRef.current) {
      const rect = planRef.current.getBoundingClientRect();
      setPlanDimensions({
        displayedWidth: rect.width,
        displayedHeight: rect.height,
      });
    }
  };

  useEffect(() => {
    const userSession = Cookies.get('userSession');
    if (userSession) {
      const user = JSON.parse(userSession);
      setFormData((prevData) => ({
        ...prevData,
        AddBy: user.prenom,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRadioChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      salle: value,
    }));
  };

  const handleTableSelection = (tableName) => {
    setFormData((prevData) => {
      const isSelected = prevData.table.includes(tableName);

      // Ajouter ou retirer la table sélectionnée
      const updatedTables = isSelected
        ? prevData.table.filter((table) => table !== tableName)
        : [...prevData.table, tableName];

      return {
        ...prevData,
        table: updatedTables,
      };
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation des champs obligatoires
  if (
    !formData.nom ||
    !formData.nombre ||
    !formData.date ||
    !formData.salle
  ) {
    setError('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  setIsSubmitting(true);
  setError(null); // Réinitialise les erreurs avant de commencer

  try {
    // Préparer les données pour la réservation
    const reservationData = {
      ...formData,
      table:
        formData.table && formData.table.length > 0
          ? formData.table.join(',')
          : '', // Utiliser une chaîne vide si aucune table sélectionnée
    };

    // Appel à l'API pour ajouter une réservation
    const result = await addReservation(reservationData);

    if (result) {
      // Redirection uniquement si succès
      router.push('/reservations');
    } else {
      setError(
        "Une erreur est survenue lors de l'ajout de la réservation."
      );
    }
  } catch (error) {
    console.error(
      'Erreur lors de l’ajout de la réservation :',
      error
    );
    setError(
      'Une erreur inattendue est survenue. Veuillez réessayer.'
    );
  } finally {
    setIsSubmitting(false); // Réinitialiser l'état du bouton de soumission
  }
};


  const tablePositions = tablePositionsBySalle[formData.salle] || [];

  return (
    <div className='flex flex-col items-center justify-center overflow-x-hidden'>
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg lg:mb-5'>
        Nouvelle Réservation
      </h2>

      <form
        className='flex flex-col gap-3 mt-5 w-11/12'
        onSubmit={handleSubmit}
      >
        <div>
          <RadioGroup
            value={formData.salle}
            onValueChange={handleRadioChange}
            required
            className='flex items-center justify-center gap-5'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='melkior'
                id='melkior'
              />
              <Label htmlFor='melkior'>Melkior</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem
                value='baltazar'
                id='baltazar'
              />
              <Label htmlFor='baltazar'>Bal'tazar</Label>
            </div>
          </RadioGroup>
        </div>

        <div className='flex flex-col gap-2 justify-center items-center lg:flex-row lg:gap-8'>
          <div className='flex flex-col justify-center items-start gap-2'>
            <Label htmlFor='nom'>Nom</Label>
            <Input
              name='nom'
              className='w-80'
              value={formData.nom}
              onChange={handleChange}
              required
            />
            <Label htmlFor='tel'>Téléphone</Label>
            <Input
              className='w-80'
              type='text'
              name='tel'
              value={formData.tel}
              onChange={handleChange}
            />
            <Label htmlFor='nombre'>Nombre de Personnes</Label>
            <Input
              type='number'
              className='w-80'
              name='nombre'
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col justify-center items-start gap-2'>
            <div className='flex items-center justify-center gap-6 mt-2'>
              <div className='flex flex-col gap-3 items-start'>
                <Label htmlFor='date'>Date</Label>
                <Input
                  className='w-36'
                  type='date'
                  name='date'
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='flex flex-col gap-3 items-start'>
                <Label htmlFor='heure'>Heure</Label>
                <Input
                  className='w-36'
                  type='time'
                  name='heure'
                  value={formData.heure}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='flex flex-col gap-2 items-start'>
              <Label htmlFor='commentaire'>Commentaire</Label>
              <Input
                className='w-80'
                type='text'
                name='commentaire'
                value={formData.commentaire}
                onChange={handleChange}
              />
            </div>
            <div className='flex items-center justify-center gap-6 mt-2'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='acompte'>Acompte</Label>
                <Input
                  className='w-36'
                  type='number'
                  name='acompte'
                  value={formData.acompte}
                  onChange={handleChange}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='table'>Table</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className='w-36'
                      disabled={!formData.salle}
                    >
                      {formData.table
                        ? `Table: ${formData.table}`
                        : 'Choisir une table'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-100 p-6 rounded-lg shadow-lg z-[9999]'>
                    <h3 className='font-bold text-white text-lg absolute top-4'>
                      Plan des tables
                    </h3>
                    <div className='relative w-full max-w-[1500px] max-h-[90%] aspect-[6753/4433] mx-auto'>
                      <img
                        ref={planRef}
                        src={
                          formData.salle === 'melkior'
                            ? '/plansDeSalle/melkior.png'
                            : '/plansDeSalle/balta.png'
                        }
                        alt='Plan des tables'
                        className='absolute max-w-[1500px] h-full object-contain'
                        onLoad={handleImageLoad}
                      />
                      {tablePositions.map((table) => {
                        const displayedX =
                          (table.x / IMAGE_REAL_WIDTH) *
                          planDimensions.displayedWidth;
                        const displayedY =
                          (table.y / IMAGE_REAL_HEIGHT) *
                          planDimensions.displayedHeight;

                        const isOccupied = occupiedTables.has(
                          table.id
                        );
                        const isSelected = formData.table.includes(
                          table.id
                        );

                        return (
                          <TableButton
                            key={table.id}
                            table={table}
                            displayedX={displayedX}
                            displayedY={displayedY}
                            isOccupied={isOccupied}
                            isSelected={isSelected}
                            onClick={() =>
                              handleTableSelection(table.id)
                            }
                          />
                        );
                      })}
                    </div>
                    <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2'>
                      <DialogTrigger asChild>
                        <Button variant='outline'>Fermer</Button>
                      </DialogTrigger>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-center lg:gap-2'>
          <Button
            type='submit'
            className='mt-4 w-80 flex gap-3 h-10'
            pendingText='Ajout en cours...'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
            <PlusIcon
              size={18}
              strokeWidth={1}
            />
          </Button>
          {error && (
            <div className='bg-red-500 text-white p-4 rounded mb-4 mt-4'>
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Page;
