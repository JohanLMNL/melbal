'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  XCircle as ClearIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
}

export function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  // Fonction locale pour gérer la sélection de date
  const handleSelect = (date: Date | undefined) => {
    onDateChange(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-80 justify-start text-left font-normal ',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selectedDate ? (
            <>
              {format(selectedDate, 'PPP', { locale: fr })}
              <ClearIcon
                className='ml-auto h-4 w-4 cursor-pointer'
                onClick={() => onDateChange(undefined)}
                aria-label='Effacer la date'
              />
            </>
          ) : (
            <span>Choisir une date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={handleSelect} // Utilisation de la fonction locale
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
export default DatePicker;
