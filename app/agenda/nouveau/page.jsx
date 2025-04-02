'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import DatePicker from '../../../components/ui/datePicker';
import MenuBar from '../../../components/layouts/MenuBar';
import { createAgenda } from '../../../utils/supabase/agenda/agendaFunctions';

const NouveauEvenement = () => {
  const router = useRouter();
  const [evenement, setEvenement] = useState('');
  const [date, setDate] = useState(null);
  const [salle, setSalle] = useState('melkior');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!evenement || !date || !salle) {
      setError('Tous les champs sont obligatoires.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createAgenda({
        evenement,
        date: date.toISOString(), // important : format ISO
        salle,
      });
      router.push('/agenda');
    } catch (err) {
      console.error('Erreur lors de la création :', err);
      setError(err.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center px-4'>
      <MenuBar />
      <h2 className='text-xl font-bold my-4'>Nouvel Évènement</h2>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 w-full max-w-md'
      >
        <Input
          type='text'
          placeholder="Nom de l'évènement"
          value={evenement}
          onChange={(e) => setEvenement(e.target.value)}
        />
        <DatePicker
          selectedDate={date}
          onDateChange={setDate}
        />
        <div className='flex gap-4'>
          <label className='flex items-center gap-2'>
            <input
              type='radio'
              value='melkior'
              checked={salle === 'melkior'}
              onChange={() => setSalle('melkior')}
            />
            Melkior
          </label>
          <label className='flex items-center gap-2'>
            <input
              type='radio'
              value='baltazar'
              checked={salle === 'baltazar'}
              onChange={() => setSalle('baltazar')}
            />
            Baltazar
          </label>
        </div>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <Button
          type='submit'
          disabled={loading}
        >
          {loading ? 'Création...' : 'Créer'}
        </Button>
      </form>
    </div>
  );
};

export default NouveauEvenement;
