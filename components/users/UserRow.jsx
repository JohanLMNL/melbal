import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '../ui/button';
import { CheckIcon, XIcon } from 'lucide-react';
import Link from 'next/link';

const UserRow = (props) => {
  return (
    <Card className='w-4/5 flex items-center justify-around h-14 mb-2'>
      <div className='capitalize w-1/6'>{props.prenom}</div>
      <div className='w-1/4 hidden md:block'>{props.mail}</div>
      <div className='capitalize w-1/6'>{props.role}</div>
      <div className='w-1/6'>
        {props.isActive === true ? (
          <CheckIcon className='text-green-500' />
        ) : (
          <XIcon className='text-red-500' />
        )}
      </div>
      <Link href={`/users/modifier/${props.id}`}>
        <Button variant='outline'>Modifier</Button>
      </Link>
    </Card>
  );
};

export default UserRow;
