'use client';
import React, { useEffect, useState } from 'react';
import AgendaCard from './AgendaCard';
import { getAllAgenda } from '../../utils/supabase/agenda/agendaFunctions';

const AgendaList = ({
  searchTerm,
  selectedDate,
  melkiorActive,
  baltazarActive,
}) => {
  const [agendaItems, setAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgenda = async () => {
      setLoading(true);
      const data = await getAllAgenda();

      // Filtrer les événements à venir
      const now = new Date();
      const upcomingEvents = data.filter(
        (agenda) => new Date(agenda.date) >= now
      );

      // Trier par ordre chronologique
      const sortedEvents = upcomingEvents.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setAgendaItems(sortedEvents);
      setLoading(false);
    };

    fetchAgenda();
  }, []);

  // Filtrer les événements en fonction de la recherche, de la date et des salles
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

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (filteredItems.length === 0) {
    return <div>Aucun événement correspondant.</div>;
  }

  return (
    <div className='flex flex-wrap gap-3 mt-4 items-center justify-center'>
      {filteredItems.map((agenda) => (
        <AgendaCard
          key={agenda.id}
          salle={agenda.salle}
          date={agenda.date}
          evenement={agenda.evenement}
        />
      ))}
    </div>
  );
};

export default AgendaList;
