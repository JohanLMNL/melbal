import Image from 'next/image'
import { Crown, Armchair, Wine } from 'lucide-react'

export function renderKindIcon(kind?: 'assises' | 'haute' | 'vip', size: 'sm' | 'md' = 'sm') {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  switch (kind) {
    case 'vip':
      return <Crown className={`${cls} text-yellow-500`} />
    case 'assises':
      return <Armchair className={`${cls} text-muted-foreground`} />
    case 'haute':
      return <Wine className={`${cls} text-indigo-500`} />
    default:
      return null
  }
}

export function renderVenueLogo(venue: string, size: number = 14) {
  const src = venue === "Bal'tazar" ? '/logos/Bal_Logo.png' : '/logos/Mel_Logo.png'
  return (
    <Image
      src={src}
      alt={venue}
      width={size}
      height={size}
      className="inline-block align-middle"
    />
  )
}

export const statusLabel = (status: string) => {
  if (status === 'arrive') return 'Arrivé'
  if (status === 'servi') return 'Servi'
  return 'En attente'
}

export const statusVariant = (status: string): 'default' | 'outline' | 'secondary' => {
  if (status === 'arrive') return 'default'
  if (status === 'servi') return 'secondary'
  return 'outline'
}

export const getVenueRowClass = (venue: string, status: string) => {
  const statusClass = status === 'servi' ? 'opacity-40 outline outline-1 outline-green-500' : status === 'arrive' ? 'outline outline-1 outline-red-500' : ''
  if (venue === "Bal'tazar") {
    return `${statusClass} bg-red-900/10 hover:bg-red-900/20`
  }
  return statusClass
}

export const getVenueCardClass = (venue: string, status: string) => {
  if (status === 'servi') {
    const base = venue === "Bal'tazar" ? 'bg-red-900/10' : ''
    return `opacity-40 border-green-500 border-2 ${base}`
  }
  if (status === 'arrive') {
    const base = venue === "Bal'tazar" ? 'bg-red-900/10' : ''
    return `border-red-500 border-2 ${base}`
  }
  if (venue === "Bal'tazar") {
    return 'bg-red-900/10 border-red-900/20'
  }
  return ''
}
