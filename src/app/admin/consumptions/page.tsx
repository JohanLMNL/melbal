"use client"

import { useEffect, useState } from "react"
import { supabase, type ConsumptionType } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, GlassWater, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export default function AdminConsumptionsPage() {
  const [types, setTypes] = useState<ConsumptionType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<{ open: boolean; item: ConsumptionType | null }>({ open: false, item: null })
  const [showDelete, setShowDelete] = useState<{ open: boolean; item: ConsumptionType | null }>({ open: false, item: null })

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    loadTypes()
  }, [])

  const loadTypes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("consumption_types")
      .select("*")
      .order("sort_order")
    if (error) {
      toast.error("Erreur de chargement", { description: error.message })
    } else {
      setTypes(data || [])
    }
    setLoading(false)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = types.findIndex((t) => t.id === active.id)
    const newIndex = types.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(types, oldIndex, newIndex)

    setTypes(reordered)

    const updates = reordered.map((t, i) => supabase
      .from("consumption_types")
      .update({ sort_order: i + 1 })
      .eq("id", t.id)
    )
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      toast.error("Erreur de sauvegarde de l'ordre", { description: failed.error.message })
      loadTypes()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GlassWater className="h-6 w-6" />
            Consommations
          </h2>
          <p className="text-muted-foreground text-sm">Glisser-déposer pour réordonner • Gérer les types disponibles à la réservation</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une consommation</DialogTitle>
            </DialogHeader>
            <ConsumptionForm
              onCancel={() => setShowAdd(false)}
              onSuccess={() => { setShowAdd(false); loadTypes() }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des consommations ({types.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : types.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune consommation définie</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={types.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {types.map((t) => (
                    <SortableRow
                      key={t.id}
                      item={t}
                      showEdit={showEdit}
                      setShowEdit={setShowEdit}
                      showDelete={showDelete}
                      setShowDelete={setShowDelete}
                      loadTypes={loadTypes}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SortableRow({
  item: t,
  showEdit, setShowEdit,
  showDelete, setShowDelete,
  loadTypes,
}: {
  item: ConsumptionType
  showEdit: { open: boolean; item: ConsumptionType | null }
  setShowEdit: (v: { open: boolean; item: ConsumptionType | null }) => void
  showDelete: { open: boolean; item: ConsumptionType | null }
  setShowDelete: (v: { open: boolean; item: ConsumptionType | null }) => void
  loadTypes: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="flex-1 font-medium">{t.name}</span>

      <div className="flex gap-2">
        <Dialog
          open={showEdit.open && showEdit.item?.id === t.id}
          onOpenChange={(o) => setShowEdit({ open: o, item: o ? t : null })}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Modifier "{t.name}"</DialogTitle></DialogHeader>
            <ConsumptionForm
              initial={t}
              onCancel={() => setShowEdit({ open: false, item: null })}
              onSuccess={() => { setShowEdit({ open: false, item: null }); loadTypes() }}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={showDelete.open && showDelete.item?.id === t.id}
          onOpenChange={(o) => setShowDelete({ open: o, item: o ? t : null })}
        >
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Supprimer "{t.name}" ?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              Cette consommation sera retirée de la liste. Les réservations existantes qui l'utilisent ne seront pas affectées.
            </p>
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button variant="outline" onClick={() => setShowDelete({ open: false, item: null })}>Annuler</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const { error } = await supabase.from("consumption_types").delete().eq("id", t.id)
                  if (error) {
                    toast.error("Erreur de suppression", { description: error.message })
                  } else {
                    toast.success("Consommation supprimée")
                    setShowDelete({ open: false, item: null })
                    loadTypes()
                  }
                }}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function ConsumptionForm({
  initial,
  onCancel,
  onSuccess,
}: {
  initial?: ConsumptionType
  onCancel: () => void
  onSuccess: () => void
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) { toast.error("Nom requis"); return }

    setSaving(true)
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("consumption_types")
          .update({ name: name.trim() })
          .eq("id", initial!.id)
        if (error) throw error
        toast.success("Consommation modifiée")
      } else {
        const { data: last } = await supabase
          .from("consumption_types")
          .select("sort_order")
          .order("sort_order", { ascending: false })
          .limit(1)
          .single()
        const nextOrder = (last?.sort_order ?? 0) + 1
        const { error } = await supabase
          .from("consumption_types")
          .insert({ name: name.trim(), sort_order: nextOrder })
        if (error) throw error
        toast.success("Consommation ajoutée")
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
      <div>
        <Label>Nom</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Btlle Champagne"
          className="mt-1"
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={save} disabled={saving}>
          {saving ? (isEdit ? "Modification..." : "Création...") : (isEdit ? "Modifier" : "Créer")}
        </Button>
      </div>
    </div>
  )
}
