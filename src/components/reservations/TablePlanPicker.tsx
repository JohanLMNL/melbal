'use client'

import Image from 'next/image'
import type { Table } from '@/lib/supabase'

export function TablePlanPicker({
  venue, tables, reserved, reservedInfo, selected, onChange,
}: {
  venue: 'Melkior' | "Bal'tazar"
  tables: Table[]
  reserved: number[]
  reservedInfo: Record<number, { name: string; guests: number }>
  selected: number[]
  onChange: (tables: number[]) => void
}) {
  const planSrc = venue === "Bal'tazar" ? '/plans/planTableBalta.png' : '/plans/planTableMelkior.png'
  const toggle = (num: number) => {
    const next = selected.includes(num) ? selected.filter(n => n !== num) : [...selected, num]
    onChange(next)
  }
  const pillClass = (kind: any, isSelected: boolean) => {
    if (kind === 'vip') {
      return isSelected
        ? 'bg-yellow-500 text-black border-yellow-500'
        : 'bg-background/90 text-yellow-700 border-yellow-500 hover:bg-yellow-50'
    }
    if (kind === 'haute') {
      return isSelected
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-background/90 text-indigo-600 border-indigo-500 hover:bg-indigo-50'
    }
    return isSelected
      ? 'bg-foreground text-background border-foreground'
      : 'bg-background/90 text-muted-foreground border-border hover:bg-accent'
  }

  const toNum = (v: any) => {
    if (v === null || typeof v === 'undefined') return undefined
    if (typeof v === 'number') return isFinite(v) ? v : undefined
    const n = parseFloat(String(v))
    return isNaN(n) ? undefined : n
  }
  const hasPos = (t: any) => toNum(t.pos_x) !== undefined && toNum(t.pos_y) !== undefined
  const list = tables || []
  const positioned = list.filter(hasPos)
  const unpositioned = list.filter(t => !hasPos(t))

  const renderButton = (t: any, isReserved: boolean, isSelected: boolean) => {
    const reservedBorder = t.kind === 'vip' ? 'border-yellow-500' : t.kind === 'haute' ? 'border-indigo-500' : 'border-foreground'
    const base = isReserved
      ? `bg-red-600 text-white ${reservedBorder} border-2 opacity-70 cursor-not-allowed`
      : pillClass(t.kind, isSelected)
    return (
      <div key={t.id} className="relative group">
        <button
          type="button"
          onClick={() => { if (!isReserved) toggle(t.table_number) }}
          aria-disabled={isReserved}
          className={`rounded-full shrink-0 p-0 overflow-hidden whitespace-nowrap text-[10px] md:text-sm leading-none font-medium border transition-colors inline-flex items-center justify-center appearance-none select-none font-mono tracking-tight ${base}`}
          style={{ borderRadius: '9999px', width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', maxWidth: '24px', maxHeight: '24px' }}
        >
          {t.table_number}
        </button>
        {isReserved && reservedInfo?.[t.table_number] && (
          <div className="pointer-events-none hidden md:group-hover:block absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full z-50 whitespace-nowrap rounded bg-black/90 text-white text-xs py-1 px-2 shadow-md">
            {reservedInfo[t.table_number].name} • {reservedInfo[t.table_number].guests} pers.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full border rounded-md overflow-hidden bg-muted">
        <Image src={planSrc} alt={`Plan ${venue}`} width={1200} height={800} className="w-full h-auto select-none pointer-events-none" />
        <div className="absolute inset-0 z-20">
          {positioned.map((t: any) => {
            const px = Math.max(0, Math.min(100, toNum(t.pos_x) as number))
            const py = Math.max(0, Math.min(100, toNum(t.pos_y) as number))
            const isReserved = reserved.includes(t.table_number)
            const isSelected = selected.includes(t.table_number)
            return (
              <div key={t.id} className="absolute" style={{ left: `${px}%`, top: `${py}%`, transform: 'translate(-50%, -50%)' }}>
                {renderButton(t, isReserved, isSelected)}
              </div>
            )
          })}
        </div>
        {unpositioned.length > 0 && (
          <div className="absolute inset-0 z-20 grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 p-2 sm:p-4 place-items-center content-start">
            {unpositioned.map((t: any) => renderButton(t, reserved.includes(t.table_number), selected.includes(t.table_number)))}
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground">Tables libres: {(tables?.length || 0) - (reserved?.length || 0)}</div>
    </div>
  )
}
