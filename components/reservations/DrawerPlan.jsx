import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { MapIcon } from 'lucide-react';
import Image from 'next/image';

const DrawerPlan = (props) => {
  return (
    <Drawer>
      <DrawerTrigger>
        {' '}
        <Button
          variant='outline'
          className='mt-4 w-80 flex gap-3 h-10'
          type='button'
        >
          Plan de Salle
          <MapIcon
            size={18}
            strokeWidth={1}
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='flex flex-col items-center justify-center'>
        <DrawerHeader>
          <DrawerTitle>{props.title}</DrawerTitle>
        </DrawerHeader>
        <Image
          src={props.image}
          width={390}
          height={390}
          alt='plan de salle'
        />
        <DrawerFooter>
          <DrawerClose>
            <Button variant='outline'>Retour</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerPlan;
