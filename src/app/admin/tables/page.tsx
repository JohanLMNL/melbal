"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase, type Profile, type Table as TableModel, type Venue, type TableKind, isBossOrAdmin } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Shield, Factory, Grid3X3 } from "lucide-react"

const VENUES: Venue[] = ["Melkior", "Bal'tazar"]
const KINDS: TableKind[] = ["assises", "haute", "vip"]

export default function AdminTablesPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableModel[]>([])
  const [venueFilter, setVenueFilter] = useState<Venue>("Melkior")

  // dialogs
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<{open: boolean, table: TableModel | null}>({ open: false, table: null })
  const [showDelete, setShowDelete] = useState<{open: boolean, table: TableModel | null}>({ open: false, table: null })

  useEffect(() => {
    loadCurrentProfile()
  }, [])

  useEffect(() => {
    if (isBossOrAdmin(currentProfile)) {
      loadTables()
    }
  }, [currentProfile, venueFilter])

  const filteredTables = useMemo(() => tables.filter(t => t.venue === venueFilter).sort((a,b) => a.table_number - b.table_number), [tables, venueFilter])

  const loadCurrentProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      if (error) {
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
    } else {
      setCurrentProfile(null)
    }
  }

  const loadTables = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tables/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue: venueFilter })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur API')
      const rows = (result.tables || []) as TableModel[]
      setTables(rows)
    } catch (e: any) {
      toast.error("Erreur de chargement des tables", { description: e.message })
    } finally {
      setLoading(false)
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
            <Grid3X3 className="h-8 w-8" />
            Gestion des tables
          </h1>
          <p className="text-muted-foreground">Ajouter, modifier et supprimer les tables par salle</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={venueFilter} onValueChange={(v: Venue) => setVenueFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENUES.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une table</DialogTitle>
              </DialogHeader>
              <CreateOrEditTableForm
                initial={{ venue: venueFilter, table_number: undefined, kind: "assises", capacity: 2 }}
                onCancel={() => setShowAdd(false)}
                onSuccess={() => { setShowAdd(false); loadTables() }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Tables – {venueFilter}
            <Badge variant="outline" className="ml-2">{filteredTables.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune table pour cette salle</div>
          ) : (
            <TableUI>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.table_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.kind}</Badge>
                    </TableCell>
                    <TableCell>{t.capacity}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={showEdit.open && showEdit.table?.id === t.id} onOpenChange={(o) => setShowEdit({ open: o, table: o ? t : null })}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier la table #{t.table_number}</DialogTitle>
                            </DialogHeader>
                            <CreateOrEditTableForm
                              initial={{ venue: t.venue, table_number: t.table_number, kind: t.kind, capacity: t.capacity, id: t.id }}
                              onCancel={() => setShowEdit({ open: false, table: null })}
                              onSuccess={() => { setShowEdit({ open: false, table: null }); loadTables() }}
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog open={showDelete.open && showDelete.table?.id === t.id} onOpenChange={(o) => setShowDelete({ open: o, table: o ? t : null })}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Supprimer la table #{t.table_number} ?</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                              Cette action est irréversible. Les réservations associées peuvent être affectées.
                            </p>
                            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                              <Button variant="outline" onClick={() => setShowDelete({ open: false, table: null })}>Annuler</Button>
                              <Button variant="destructive" onClick={async () => {
                                try {
                                  const res = await fetch('/api/admin/tables/delete', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: t.id })
                                  })
                                  const result = await res.json()
                                  if (!res.ok) throw new Error(result.error || 'Erreur API')
                                  toast.success("Table supprimée")
                                  setShowDelete({ open: false, table: null })
                                  loadTables()
                                } catch (e: any) {
                                  toast.error("Erreur de suppression", { description: e.message })
                                }
                              }}>Supprimer définitivement</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableUI>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Génération de tables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Créer rapidement une série de tables pour la salle sélectionnée.</p>
          <BulkGenerator venue={venueFilter} onDone={loadTables} />
        </CardContent>
      </Card>
    </div>
  )
}

function CreateOrEditTableForm({ initial, onCancel, onSuccess }: {
  initial: { id?: number, venue: Venue, table_number?: number, kind: TableKind, capacity: number },
  onCancel: () => void,
  onSuccess: () => void,
}) {
  const isEdit = typeof initial.id !== "undefined"
  const [venue, setVenue] = useState<Venue>(initial.venue)
  const [tableNumber, setTableNumber] = useState<string>(initial.table_number?.toString() ?? "")
  const [kind, setKind] = useState<TableKind>(initial.kind)
  const [capacity, setCapacity] = useState<string>(initial.capacity.toString())
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!tableNumber) { toast.error("Numéro de table requis"); return }
    const num = parseInt(tableNumber, 10)
    if (isNaN(num) || num <= 0) { toast.error("Numéro de table invalide"); return }
    const cap = parseInt(capacity, 10)
    if (isNaN(cap) || cap <= 0) { toast.error("Capacité invalide"); return }

    setSaving(true)
    try {
      if (isEdit) {
        const res = await fetch('/api/admin/tables/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: initial.id!, venue, table_number: num, kind, capacity: cap })
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Erreur API')
        toast.success("Table modifiée")
      } else {
        const res = await fetch('/api/admin/tables/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ venue, table_number: num, kind, capacity: cap })
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Erreur API')
        toast.success("Table ajoutée")
      }
      onSuccess()
    } catch (e: any) {
      toast.error("Erreur d'enregistrement", { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Salle</Label>
          <Select value={venue} onValueChange={(v: Venue) => setVenue(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENUES.map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Numéro</Label>
          <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="ex: 12" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={kind} onValueChange={(v: TableKind) => setKind(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KINDS.map(k => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Capacité</Label>
          <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={save} disabled={saving}>{saving ? (isEdit ? "Modification..." : "Création...") : (isEdit ? "Modifier" : "Créer")}</Button>
      </div>
    </div>
  )
}

function BulkGenerator({ venue, onDone }: { venue: Venue, onDone: () => void }) {
  const [start, setStart] = useState("1")
  const [end, setEnd] = useState("10")
  const [kind, setKind] = useState<TableKind>("assises")
  const [capacity, setCapacity] = useState("2")
  const [saving, setSaving] = useState(false)

  const generate = async () => {
    const a = parseInt(start, 10)
    const b = parseInt(end, 10)
    const cap = parseInt(capacity, 10)
    if ([a,b,cap].some(n => isNaN(n))) { toast.error("Valeurs invalides"); return }
    if (a <= 0 || b <= 0 || cap <= 0) { toast.error("Valeurs doivent être positives"); return }
    if (b < a) { toast.error("La fin doit être supérieure ou égale au début"); return }

    setSaving(true)
    try {
      const items = Array.from({ length: b - a + 1 }, (_, i) => a + i).map((n) => ({
        venue,
        table_number: n,
        kind,
        capacity: cap
      }))

      const res = await fetch('/api/admin/tables/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur API')
      toast.success(`${result.count} table(s) créées`)
      onDone()
    } catch (e: any) {
      toast.error("Erreur de génération", { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <div>
        <Label>Début</Label>
        <Input value={start} onChange={e => setStart(e.target.value)} />
      </div>
      <div>
        <Label>Fin</Label>
        <Input value={end} onChange={e => setEnd(e.target.value)} />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={kind} onValueChange={(v: TableKind) => setKind(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KINDS.map(k => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Capacité</Label>
        <Input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={generate} disabled={saving}><Factory className="h-4 w-4 mr-2" /> Générer</Button>
      </div>
    </div>
  )
}
