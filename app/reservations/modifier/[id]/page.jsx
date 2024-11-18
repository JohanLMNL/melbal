'use client';
import React, { useState, useEffect } from 'react';
import MenuBar from '../../../../components/layouts/MenuBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  PenLineIcon,
  ChevronLeftIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react';
import {
  fetchResaById,
  updateResaById,
  deleteResaById,
} from '../../../../utils/supabase/reservation';
import { useRouter, useParams } from 'next/navigation';
import DrawerPlan from '../../../../components/reservations/DrawerPlan';
import Cookies from 'js-cookie';

const ModifierResa = () => {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    salle: '',
    nom: '',
    tel: '',
    nombre: '',
    date: new Date().toISOString().split('T')[0],
    heure: '',
    commentaire: '',
    acompte: '',
    table: '',
    AddBy: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); // Nouvelle variable pour gérer les erreurs

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const reservation = await fetchResaById(id);
        if (reservation) {
          setFormData({
            salle: reservation.salle || '',
            nom: reservation.nom || '',
            tel: reservation.tel || '',
            nombre: reservation.nombre || '',
            date:
              reservation.date ||
              new Date().toISOString().split('T')[0],
            heure: reservation.heure || null,
            commentaire: reservation.commentaire || '',
            acompte: reservation.acompte || '',
            table: reservation.table || '',
            AddBy: reservation.AddBy || '',
          });
        }
      };
      fetchData();
    }
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Réinitialiser l'erreur au début de la soumission

    if (
      !formData.nom ||
      !formData.nombre ||
      !formData.date ||
      !formData.salle
    ) {
      alert('Veuillez remplir tous les champs obligatoires.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting formData:', formData); // Debugging log

      const result = await updateResaById(id, formData);

      if (result) {
        Cookies.set('selectedReservationDate', formData.date, {
          expires: 7,
          path: '/',
        });
        router.push('/reservations');
      } else {
        setError(
          'Une erreur est survenue lors de la modification de la réservation.'
        );
      }
    } catch (error) {
      console.error(
        'Erreur lors de la modification de la réservation:',
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
      const result = await deleteResaById(id);
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

  const handleBack = () => {
    Cookies.set('selectedReservationDate', formData.date, {
      expires: 7,
      path: '/',
    });
    router.push('/reservations');
  };

  return (
    <div className='flex flex-col items-center justify-center overflow-x-hidden'>
      <MenuBar />
      <h2 className='mt-2 font-bold text-lg lg:mb-5'>
        Modifier la réservation
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
                <Input
                  className='w-36'
                  type='text'
                  name='table'
                  value={formData.table}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <p className='font-thin'>Ajouter par :</p>
          <p className='font-bold'>{formData.AddBy}</p>
        </div>

        <div className='flex flex-col items-center justify-center'>
          <div className='flex items-center justify-center gap-8'>
            <Button
              className='mt-4 w-36 flex gap-2 h-10'
              onClick={handleBack}
              type='button' // changed to prevent form submission on back
            >
              <ChevronLeftIcon
                size={18}
                strokeWidth={1}
              />{' '}
              Retour
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='destructive'
                  className='mt-4 w-36 flex gap-2 h-10'
                >
                  Supprimer{' '}
                  <Trash2Icon
                    size={18}
                    strokeWidth={1}
                  />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className='flex flex-col items-center justify-center'>
                    <TriangleAlertIcon
                      size={24}
                      strokeWidth={1}
                    />
                  </AlertDialogTitle>
                  <AlertDialogDescription className='flex flex-col items-center justify-center text-base'>
                    Êtes-vous sûr de vouloir supprimer la réservation
                    de
                    <span className='font-bold'>
                      {formData.nom} ?
                    </span>
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
                      />{' '}
                      Retour
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    <Button
                      variant={'destructive'}
                      className='w-28 h-9'
                    >
                      Supprimer{' '}
                      <Trash2Icon
                        size={18}
                        strokeWidth={1}
                      />
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {formData.salle && (
            <DrawerPlan
              title={
                formData.salle == 'melkior' ? 'Melkior' : "Bal'tazar"
              }
              image={
                formData.salle == 'melkior'
                  ? '/plansdeSalle/PlanTableMelkiorpng.png'
                  : '/plansdeSalle/PlanTableBaltapng.png'
              }
            />
          )}

          <Button
            type='submit'
            className='mt-4 w-80 flex gap-3 h-10'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Modification en cours...' : 'Modifier'}
            <PenLineIcon
              size={18}
              strokeWidth={1}
            />
          </Button>

          {/* Message d'erreur */}
          {error && <div className='text-red-500 mt-2'>{error}</div>}
        </div>
      </form>
    </div>
  );
};

export default ModifierResa;
