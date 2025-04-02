'use client';
import React, { useEffect, useState } from 'react';
import AgendaCard from './AgendaCard';
import {
  getAllAgenda,
  deleteAgenda,
} from '../../utils/supabase/agenda/agendaFunctions';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const AgendaList = ({
  searchTerm,
  selectedDate,
  melkiorActive,
  baltazarActive,
}) => {
  const [agendaItems, setAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      setLoading(true);
      const data = await getAllAgenda();

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcomingEvents = data.filter((agenda) => {
        const eventDate = new Date(agenda.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
      });

      const sortedEvents = upcomingEvents.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setAgendaItems(sortedEvents);
      setLoading(false);
    };

    fetchAgenda();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteAgenda(selectedEventId);
      setAgendaItems((prev) =>
        prev.filter((item) => item.id !== selectedEventId)
      );
      setSelectedEventId(null);
    } catch (err) {
      console.error('❌ Erreur suppression :', err);
    }
  };

  const filteredItems = agendaItems.filter((agenda) => {
    const matchesSearchTerm = agenda.evenement
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSelectedDate = selectedDate
      ? new Date(agenda.date).toDateString() ===
        selectedDate.toDateString()
      : true;

    const matchesSalle =
      (melkiorActive && agenda.salle === 'melkior') ||
      (baltazarActive && agenda.salle === 'baltazar');

    return matchesSearchTerm && matchesSelectedDate && matchesSalle;
  });

  if (loading) return <div>Chargement...</div>;
  if (filteredItems.length === 0)
    return <div>Aucun événement correspondant.</div>;

  return (
    <div className='flex flex-wrap gap-3 mt-4 items-center justify-center'>
      {filteredItems.map((agenda) => (
        <div
          key={agenda.id}
          className='relative'
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className='absolute top-2 right-2 z-20 bg-white rounded-full text-gray-500 hover:text-red-600 shadow-md p-1'
                onClick={() => setSelectedEventId(agenda.id)}
                title="Supprimer l'évènement"
              >
                ✕
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirmer la suppression
                </AlertDialogTitle>
              </AlertDialogHeader>
              <p>Es-tu sûr de vouloir supprimer cet évènement ?</p>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AgendaCard
            salle={agenda.salle}
            date={agenda.date}
            evenement={agenda.evenement}
          />
        </div>
      ))}
    </div>
  )
};

export default AgendaList;
