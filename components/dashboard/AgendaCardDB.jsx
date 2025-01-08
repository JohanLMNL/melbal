'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Link from 'next/link';
import { getNextEvents } from '../../utils/supabase/agenda/agendaFunctions';

const AgendaCardDB = () => {
  const [nextEvents, setNextEvents] = useState([]);

  useEffect(() => {
    const fetchNextEvents = async () => {
      const events = await getNextEvents();
      setNextEvents(events);
    };

    fetchNextEvents();
  }, []);

  return (
    <div className='mb-3'>
      <Link href='/agenda'>
        <Card className='bg-transparent flex flex-col w-96 h-auto'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarDays />
              Agenda
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center gap-2'>
            {nextEvents.length > 0 ? (
              nextEvents.map((event) => (
                <div
                  key={event.id}
                  className='text-center border-b border-dashed pb-2 last:border-0'
                >
                  <p className='text-sm font-light text-muted-foreground uppercase'>
                    {new Date(event.date).toLocaleDateString(
                      'fr-FR',
                      {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                  <p className='text-lg font-bold uppercase'>
                    {event.evenement} ({event.salle})
                  </p>
                </div>
              ))
            ) : (
              <p>Aucun événement à venir.</p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default AgendaCardDB;
