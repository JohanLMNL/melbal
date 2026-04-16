'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminUsersPage from './users/page'
import AdminTablesPage from './tables/page'
import AdminConsumptionsPage from './consumptions/page'
import { Button } from '@/components/ui/button'

export default function AdminIndexPage() {
  const [tab, setTab] = useState<'users' | 'tables' | 'consumptions'>('users')

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Administration</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={tab === 'users' ? 'default' : 'outline'} onClick={() => setTab('users')}>Utilisateurs</Button>
          <Button size="sm" variant={tab === 'tables' ? 'default' : 'outline'} onClick={() => setTab('tables')}>Tables</Button>
          <Button size="sm" variant={tab === 'consumptions' ? 'default' : 'outline'} onClick={() => setTab('consumptions')}>Consommations</Button>
          <Link href="/admin/tables/positions">
            <Button size="sm" variant="outline">Plans</Button>
          </Link>
        </div>
      </div>

      <div>
        {tab === 'users' ? (
          <AdminUsersPage />
        ) : tab === 'tables' ? (
          <AdminTablesPage />
        ) : (
          <AdminConsumptionsPage />
        )}
      </div>
    </div>
  )
}
