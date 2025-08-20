import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEuro(cents: number | null): string {
  if (cents === null || cents === undefined) return '0,00 €'
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

export function parseEuroToCents(input: string): number {
  const cleaned = input.replace(/[€\s]/g, '').replace(',', '.')
  const euros = parseFloat(cleaned)
  return Math.round(euros * 100)
}
