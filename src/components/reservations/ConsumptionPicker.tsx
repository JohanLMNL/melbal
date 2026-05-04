'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { ConsumptionType } from '@/lib/supabase'

export function ConsumptionPicker({
  consumptionTypes,
  value,
  onChange,
}: {
  consumptionTypes: ConsumptionType[]
  value: { consumption_type_id: number; quantity: number }[]
  onChange: (v: { consumption_type_id: number; quantity: number }[]) => void
}) {
  const addLine = () => {
    if (consumptionTypes.length === 0) return
    const usedIds = value.map(v => v.consumption_type_id)
    const first = consumptionTypes.find(t => !usedIds.includes(t.id))
    if (!first) return
    onChange([...value, { consumption_type_id: first.id, quantity: 1 }])
  }

  const removeLine = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const updateLine = (idx: number, field: 'consumption_type_id' | 'quantity', val: number) => {
    onChange(value.map((line, i) => i === idx ? { ...line, [field]: val } : line))
  }

  return (
    <div className="space-y-2">
      {value.map((line, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Select
            value={String(line.consumption_type_id)}
            onValueChange={(v) => updateLine(idx, 'consumption_type_id', Number(v))}
          >
            <SelectTrigger className="flex-1 min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {consumptionTypes.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="1"
            value={line.quantity}
            onChange={(e) => updateLine(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center min-h-[44px]"
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(idx)}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLine}
        disabled={value.length >= consumptionTypes.length}
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter un produit
      </Button>
    </div>
  )
}
