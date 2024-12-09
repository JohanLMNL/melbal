import React from 'react';
import { Button } from '@/components/ui/button';

const TableButton = React.memo(
  ({
    table,
    displayedX,
    displayedY,
    isOccupied,
    isSelected,
    onClick,
  }) => {
    return (
      <Button
        variant={
          isOccupied ? 'destructive' : isSelected ? 'blue' : 'default'
        }
        onClick={onClick}
        className='absolute w-6 h-6 rounded-full text-white p-0' // Supprimer tout padding supplémentaire
        style={{
          top: `${displayedY}px`,
          left: `${displayedX}px`,
          transform: 'translate(-50%, -50%)',
        }}
        type='button'
        disabled={isOccupied}
      >
        {table.id}
      </Button>
    );
  }
);

export default TableButton;
