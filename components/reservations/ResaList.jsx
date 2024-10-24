'use client';
import React, { useEffect, useState } from 'react';
import { getAllReservations } from '../../utils/supabase/reservation';
import ResaCard from './ResaCard';
import { FrownIcon } from 'lucide-react';
import Link from 'next/link';

import {
  getCurrentDate,
  formatDate,
} from '@/utils/transformDateandHour';

const ResaList = ({ dateDeTri, searchTerm, melkior, baltazar }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getAllReservations();
        setReservations(data);
      } catch (error) {
        setError('Erreur lors de la récupération des réservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  let filteredReservations = reservations;

  //Afficher les réservations du jour
  if (searchTerm === '' && !dateDeTri) {
    filteredReservations = filteredReservations.filter(
      (reservation) => reservation.date === getCurrentDate()
    );
  }

  // Afficher les réservations lors d'une recherche par nom
  if (searchTerm !== '') {
    filteredReservations = filteredReservations.filter(
      (reservation) =>
        reservation.nom
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }

  // Afficher les réservations à la date sélectionnée
  if (dateDeTri) {
    filteredReservations = filteredReservations.filter(
      (reservation) => reservation.date === formatDate(dateDeTri)
    );
  }

  // Afficher les réservations par heure croissantes
  filteredReservations = filteredReservations.sort((a, b) => {
    const heureA = new Date(`1970-01-01T${a.heure}:00`).getTime();
    const heureB = new Date(`1970-01-01T${b.heure}:00`).getTime();
    return heureA - heureB;
  });

  // Tri en fonction de la salle
  filteredReservations = filteredReservations.filter(
    (reservation) => {
      if (reservation.salle === 'melkior' && !melkior) return false;
      if (reservation.salle === 'baltazar' && !baltazar) return false;
      return true;
    }
  );

  if (loading) {
    return <div>Chargement des réservations en cours...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='flex flex-col items-center gap-3 mt-8 lg:flex-row lg:flex-wrap lg:justify-center'>
      {filteredReservations.length === 0 ? (
        <div className='flex flex-col gap-1 items-center justify-center'>
          <FrownIcon
            size={32}
            strokeWidth={1}
          />
          Il n'y a pas de réservation pour cette date...
        </div>
      ) : (
        filteredReservations.map((reservation) => (
          <Link
            key={reservation.id}
            href={`/reservations/modifier/${reservation.id}`}
          >
            <ResaCard
              key={reservation.id}
              salle={reservation.salle}
              date={reservation.date}
              heure={reservation.heure}
              nom={reservation.nom}
              nombre={reservation.nombre}
              acompte={reservation.acompte}
              table={reservation.table}
            />
          </Link>
        ))
      )}
    </div>
  );
};

export default ResaList;
