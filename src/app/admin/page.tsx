'use client'

import { useState } from 'react'
import AdminUsersPage from './users/page'
import AdminTablesPage from './tables/page'
import { Button } from '@/components/ui/button'

export default function AdminIndexPage() {
  const [tab, setTab] = useState<'users' | 'tables'>('users')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administration</h1>
        <div className="flex gap-2">
          <Button variant={tab === 'users' ? 'default' : 'outline'} onClick={() => setTab('users')}>Utilisateurs</Button>
          <Button variant={tab === 'tables' ? 'default' : 'outline'} onClick={() => setTab('tables')}>Tables</Button>
        </div>
      </div>

      <div>
        {tab === 'users' ? (
          <AdminUsersPage />
        ) : (
          <AdminTablesPage />
        )}
      </div>
    </div>
  )
}
