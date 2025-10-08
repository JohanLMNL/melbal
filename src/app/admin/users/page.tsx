'use client'

import { useState, useEffect } from 'react'
import { supabase, type Profile, isBossOrAdmin } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Shield, Server, Package, UserPlus, Crown, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newUser, setNewUser] = useState<{ password: string; username: string; role: 'admin' | 'server' | 'porter' | 'boss' }>({ password: '', username: '', role: 'server' })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: { id: string; username: string } | null }>({ open: false, user: null })

  useEffect(() => {
    console.log('Component mounted, loading data...')
    loadCurrentProfile()
    loadProfiles()
  }, [])

  const loadCurrentProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) {
        // Fallback to auth metadata if DB profile is not accessible
        const role = (user.user_metadata as any)?.role
        const username = (user.user_metadata as any)?.username || user.email?.split('@')[0]
        if (role) {
          setCurrentProfile({ id: user.id, username, role, created_at: new Date().toISOString() } as any)
        } else {
          setCurrentProfile(null)
        }
      } else {
        setCurrentProfile(data)
      }
    }
  }

  const loadProfiles = async () => {
    setLoading(true)
    console.log('Loading profiles...')
    const { data, error } = await supabase
      .rpc('get_user_profiles')

    console.log('Profiles response:', { data, error })
    
    if (error) {
      console.error('Error loading profiles:', error)
      toast.error('Erreur de chargement', { description: error.message })
    } else {
      console.log('Setting profiles:', data)
      setProfiles(data || [])
    }
    setLoading(false)
  }

  const createUser = async () => {
    if (!newUser.password || !newUser.username) {
      toast.error('Tous les champs sont requis')
      return
    }

    setCreating(true)
    try {
      // Appeler l'API route pour créer l'utilisateur de manière sécurisée
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newUser.password,
          username: newUser.username,
          role: newUser.role
        }),
      })

      const result = await response.json()
      console.log('API Response:', { status: response.status, result })

      if (!response.ok) {
        console.error('API Error:', result.error)
        toast.error('Erreur de création', { description: result.error })
        return
      }

      if (result.success && result.user) {
        toast.success('Utilisateur créé avec succès')
        setNewUser({ password: '', username: '', role: 'server' as 'admin' | 'server' | 'porter' | 'boss' })
        setShowAddDialog(false)
        loadProfiles()
      } else {
        console.error('Unexpected API response:', result)
        toast.error('Erreur inattendue', { description: 'Réponse API invalide' })
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const updateRole = async (profileId: string, newRole: 'admin' | 'server' | 'porter' | 'boss') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)

    if (error) {
      toast.error('Erreur de mise à jour', { description: error.message })
    } else {
      toast.success('Rôle mis à jour avec succès')
      loadProfiles()
    }
  }

  const openDeleteDialog = (profileId: string, username: string) => {
    setDeleteDialog({ open: true, user: { id: profileId, username } })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, user: null })
  }

  const confirmDeleteUser = async () => {
    if (!deleteDialog.user) return

    const { id: profileId, username } = deleteDialog.user
    setDeleting(profileId)
    
    try {
      // Supprimer d'abord le profil via fonction SQL
      const { error: profileError } = await supabase
        .rpc('delete_user_profile', { user_id: profileId })

      if (profileError) {
        toast.error('Erreur de suppression du profil', { description: profileError.message })
        return
      }

      // Supprimer l'utilisateur via l'API admin
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: profileId }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.warn('Erreur suppression auth:', result.details)
        // On continue même si la suppression auth échoue, le profil est supprimé
      }

      toast.success('Utilisateur supprimé avec succès')
      loadProfiles()
      closeDeleteDialog()
    } catch (error) {
      toast.error('Erreur inattendue lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'boss': return <Crown className="h-4 w-4" />
      case 'server': return <Server className="h-4 w-4" />
      case 'porter': return <Package className="h-4 w-4" />
      default: return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'boss': return 'destructive'
      case 'server': return 'default'
      case 'porter': return 'secondary'
      default: return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur'
      case 'boss': return 'Boss'
      case 'server': return 'Serveur'
      case 'porter': return 'Portier'
      default: return role
    }
  }

  if (!isBossOrAdmin(currentProfile)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous devez être administrateur ou boss pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Administration des comptes utilisateurs
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Pseudo</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="pseudo"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mot de passe sécurisé"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUser.role} onValueChange={(value: 'admin' | 'server' | 'porter' | 'boss') => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boss">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Boss
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrateur
                      </div>
                    </SelectItem>
                    <SelectItem value="server">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Serveur
                      </div>
                    </SelectItem>
                    <SelectItem value="porter">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Portier
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={createUser} disabled={creating}>
                  {creating ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs
            <Badge variant="outline" className="ml-2">
              {profiles.length} utilisateur{profiles.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pseudo</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.username}
                      {profile.id === currentProfile?.id && (
                        <Badge variant="outline" className="ml-2">Vous</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(profile.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(profile.role)}
                        {getRoleLabel(profile.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(profile.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={profile.role}
                        onValueChange={(newRole: 'admin' | 'server' | 'porter' | 'boss') => 
                          updateRole(profile.id, newRole)
                        }
                        disabled={profile.id === currentProfile?.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boss">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Boss
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Administrateur
                            </div>
                          </SelectItem>
                          <SelectItem value="server">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4" />
                              Serveur
                            </div>
                          </SelectItem>
                          <SelectItem value="porter">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Portier
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {profile.id === currentProfile?.id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Impossible de modifier votre propre rôle
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.id !== currentProfile?.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(profile.id, profile.username)}
                          disabled={deleting === profile.id}
                        >
                          {deleting === profile.id ? (
                            'Suppression...'
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle>Supprimer l'utilisateur</DialogTitle>
                <DialogDescription className="mt-1">
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <span className="font-semibold text-foreground">
                "{deleteDialog.user?.username}"
              </span>{' '}
              ? Toutes ses données seront définitivement supprimées.
            </p>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleting === deleteDialog.user?.id}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleting === deleteDialog.user?.id}
            >
              {deleting === deleteDialog.user?.id ? (
                'Suppression...'
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
