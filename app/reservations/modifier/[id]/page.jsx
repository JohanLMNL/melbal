'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchResaById,
  getReservationsByDate,
  updateResaById,
  deleteResaById,
} from '../../../../utils/supabase/reservation';
import { tablePositionsBySalle } from '../../../../utils/tableConfig';
import { IMAGE_REAL_DIMENSIONS } from '../../../../utils/imageConstants';
import TableButton from '../../../../components/reservations/tableButtons';
import MenuBar from '../../../../components/layouts/MenuBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2Icon, ChevronLeftIcon } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@radix-ui/react-dialog';
import Cookies from 'js-cookie'; // Importer js-cookie

const EditReservationPage = () => {
  const { id: reservationId } = useParams(); // Récupérer l'ID de la réservation depuis l'URL
  const router = useRouter();

  const planRef = useRef(null);
  const [planDimensions, setPlanDimensions] = useState({
    displayedWidth: 0,
    displayedHeight: 0,
  });
  const { width: IMAGE_REAL_WIDTH, height: IMAGE_REAL_HEIGHT } =
    IMAGE_REAL_DIMENSIONS;

  const [formData, setFormData] = useState({
    salle: '',
    nom: '',
    tel: '',
    nombre: '',
    date: '',
    heure: null,
    commentaire: '',
    acompte: '',
    table: [],
  });

  const [reservations, setReservations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données de la réservation
  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) return; // Attendre que l'ID soit disponible
      try {
        const data = await fetchResaById(reservationId); // Récupérer les données de la réservation
        setFormData((prevData) => ({
          ...prevData,
          ...data,
          table: data.table ? data.table.split(',') : [], // Convertir la chaîne en tableau pour les tables
        }));
      } catch (error) {
        console.error(
          'Erreur lors du chargement de la réservation :',
          error
        );
        setError('Impossible de charger la réservation.');
      }
    };

    fetchReservation();
  }, [reservationId]); // Recharger uniquement si l'ID change

  // Charger les réservations de la même date pour les tables occupées
  useEffect(() => {
    const fetchReservationsForDate = async () => {
      try {
        const data = await getReservationsByDate(formData.date);
        setReservations(data);
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des réservations :',
          error
        );
      }
    };

    if (formData.date) fetchReservationsForDate();
  }, [formData.date]);

  useEffect(() => {
    if (formData.date) {
      Cookies.set('selectedReservationDate', formData.date, {
        expires: 7,
      }); // Sauvegarde du cookie pour 7 jours
      console.log('Cookie saveDate mis à jour avec:', formData.date);
    }
  }, [formData.date]); // Exécute cet effet chaque fois que formData.date change

  const getOccupiedTables = useMemo(() => {
    const occupied = new Set();
    reservations
      .filter(
        (resa) =>
          resa.salle === formData.salle && resa.id !== reservationId
      ) // Exclure la réservation actuelle
      .forEach((resa) => {
        if (resa.table) {
          resa.table
            .split(',')
            .forEach((table) => occupied.add(table.trim()));
        }
      });
    return occupied;
  }, [reservations, formData.salle, reservationId]);

  const occupiedTables = getOccupiedTables; // Mémorisation pour optimisation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageLoad = () => {
    if (planRef.current) {
      const rect = planRef.current.getBoundingClientRect();
      setPlanDimensions({
        displayedWidth: rect.width,
        displayedHeight: rect.height,
      });
    }
  };

  const handleTableSelection = (tableName) => {
    setFormData((prevData) => {
      const isSelected = prevData.table.includes(tableName);
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
      const updatedData = {
        ...formData,
        table: formData.table.join(','), // Convertir les tables en chaîne pour l'envoi
      };

      await updateResaById(reservationId, updatedData); // Mettre à jour la réservation
      router.push('/reservations'); // Redirection en cas de succès
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la réservation :',
        error
      );
      setError(
        'Une erreur inattendue est survenue. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteResaById(reservationId);
      router.push('/reservations');
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de la réservation:',
        error
      );
      alert(
        'Une erreur inattendue est survenue. Veuillez réessayer.'
      );
    }
  };

  const tablePositions = tablePositionsBySalle[formData.salle] || [];

  return (
    <div className='flex flex-col items-center justify-center overflow-x-hidden'>
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg lg:mb-5'>
        Modifier Réservation
      </h2>

      <form
        className='flex flex-col gap-3 mt-5 w-11/12'
        onSubmit={handleSubmit}
      >
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
            <div className='flex justify-center gap-8'>
              <div className='flex flex-col gap-2'>
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
              <div className='flex flex-col gap-2'>
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
            <Label htmlFor='commentaire'>Commentaire</Label>
            <Input
              className='w-80'
              type='text'
              name='commentaire'
              value={formData.commentaire}
              onChange={handleChange}
            />{' '}
            <div className='flex flex-col gap-2'>
              <Label htmlFor='table'>Table</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className='w-80'
                    variant='outline'
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

                      const isOccupied = occupiedTables.has(table.id);
                      const isSelected = formData.table.includes(
                        table.id
                      );

                      return (
                        <TableButton
                          key={table.id}
                          table={table}
                          displayedX={displayedX}
                          displayedY={displayedY}
                          isOccupied={isOccupied && !isSelected} // Marquer occupé seulement si non sélectionné
                          isSelected={isSelected} // Marquer la table comme sélectionnée
                          onClick={() =>
                            handleTableSelection(table.id)
                          }
                          className={isSelected ? 'bg-blue-500' : ''} // Ajouter une classe CSS pour les tables sélectionnées
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
          <Button
            type='button'
            variant='outline'
            className='mt-4 w-80 flex gap-3 h-10'
            onClick={() => router.push('/reservations')}
          >
            <ChevronLeftIcon
              size={18}
              strokeWidth={1}
            />
            Retour
          </Button>
          <Button
            type='submit'
            className='mt-4 w-80 flex gap-3 h-10'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Modification en cours...' : 'Modifier'}
            <PlusIcon
              size={18}
              strokeWidth={1}
            />
          </Button>

          <Button
            type='button'
            variant='destructive'
            className='mt-4 w-80 flex gap-3 h-10'
            onClick={() => handleDelete()}
          >
            Supprimer
            <Trash2Icon
              size={18}
              strokeWidth={1}
            />
          </Button>
        </div>

        {error && (
          <div className='bg-red-500 text-white p-4 rounded mb-4 mt-4'>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditReservationPage;
