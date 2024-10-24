'use client';
import React, { useState, useEffect } from 'react';
import MenuBar from '../../../components/layouts/MenuBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/app/login/submit-button';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { PlusIcon } from 'lucide-react';
import { addReservation } from '../../../utils/supabase/reservation';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Importer js-cookie pour accéder au cookie
import DrawerPlan from '../../../components/reservations/DrawerPlan';

const Page = () => {
  const router = useRouter();

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer l'utilisateur depuis le cookie lors du chargement
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.nom ||
      !formData.nombre ||
      !formData.date ||
      !formData.salle
    ) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addReservation(formData); // Ajouter la réservation avec le champ AddBy

      if (result) {
        router.push('/reservations');
      } else {
        alert(
          "Une erreur est survenue lors de l'ajout de la réservation."
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout de la réservation :",
        error
      );
      alert(
        'Une erreur inattendue est survenue. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Input fields */}
        <div className='flex flex-col gap-2 justify-center items-center lg:flex-row lg:gap-8'>
          {/* Group 1 */}
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
              value={formData.telephone}
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

          {/* Group 2 */}
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
                  type='number'
                  name='table'
                  value={formData.table}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-center lg:gap-2'>
          {formData.salle && (
            <DrawerPlan
              title={
                formData.salle == 'melkior' ? 'Melkior' : "Bal'tazar"
              }
              image={
                formData.salle == 'melkior'
                  ? '/plansdeSalle/PlanTableMelkior.svg'
                  : '/plansdeSalle/PlanTableBalta.svg'
              }
            />
          )}
          <SubmitButton
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
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};

export default Page;
