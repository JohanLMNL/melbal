'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calculator, Home, Plus, Minus, Divide, RotateCcw, History } from 'lucide-react'

type HistoryItem = {
  id: string;
  type: "add" | "deduct";
  amount: number;
  at: number;
};

function formatEUR(v: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function toNumber(value: string) {
  const normalized = value.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function ceilToHalf(value: number) {
  return Math.ceil(value * 2) / 2;
}

function floorToHalf(value: number) {
  return Math.floor(value * 2) / 2;
}

function formatShortEUR(v: number) {
  const isInt = Math.abs(v - Math.round(v)) < 1e-9;
  if (isInt) return `${Math.round(v)}€`;
  const half = Math.round((v - Math.floor(v)) * 2) / 2; // 0 or 0.5
  const whole = Math.floor(v);
  const dec = half === 0.5 ? ",5" : "";
  return `${whole}${dec}€`;
}

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  try {
    const buf = new Uint8Array(16);
    if (globalThis.crypto && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;
      const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  } catch {}
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function EncaissementPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [addInput, setAddInput] = useState<string>("");
  const [deductInput, setDeductInput] = useState<string>("");
  const [partsInput, setPartsInput] = useState<string>("2");
  const [divided, setDivided] = useState<number[] | null>(null);

  function getRemaining() {
    const added = history
      .filter((h: HistoryItem) => h.type === "add")
      .reduce((s: number, h: HistoryItem) => s + h.amount, 0);
    const deducted = history
      .filter((h: HistoryItem) => h.type === "deduct")
      .reduce((s: number, h: HistoryItem) => s + h.amount, 0);
    const total = added - deducted;
    return Math.max(0, Number(total.toFixed(2)));
  }

  function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = toNumber(addInput);
    if (!Number.isFinite(v) || v <= 0) return;
    addAmount(v);
    setAddInput("");
  }

  function handleDeductSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = toNumber(deductInput);
    if (!Number.isFinite(v) || v <= 0) return;
    deductAmount(v);
    setDeductInput("");
  }

  function addAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setHistory((prev: HistoryItem[]) => [
      { id: uuid(), type: "add", amount: Number(amount.toFixed(2)), at: Date.now() },
      ...prev,
    ]);
    setDivided(null);
  }

  function deductAmount(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const remaining = getRemaining();
    const safe = Math.min(remaining, amount);
    if (safe <= 0) return;
    setHistory((prev: HistoryItem[]) => [
      { id: uuid(), type: "deduct", amount: Number(safe.toFixed(2)), at: Date.now() },
      ...prev,
    ]);
    setDivided(null);
  }

  function divideRemaining(n: number, remainingOverride?: number) {
    if (!Number.isFinite(n) || n <= 0) return setDivided(null);
    const remaining = Number.isFinite(remainingOverride as number)
      ? (remainingOverride as number)
      : getRemaining();
    if (remaining <= 0) return setDivided([]);
    const partsCount = Math.trunc(n);
    const baseRaw = remaining / partsCount;
    const base = floorToHalf(baseRaw);

    // n-1 parts égales à base
    const parts: number[] = Array.from({ length: Math.max(0, partsCount - 1) }, () => base);
    const sumOfEqual = parts.reduce((s, v) => s + v, 0);
    const lastRaw = remaining - sumOfEqual;
    let last = ceilToHalf(lastRaw);
    if (last < base) last = base; // garantir que la dernière est >= aux autres

    parts.push(Number(last.toFixed(2)));
    setDivided(parts);
  }

  function resetEncaissement() {
    setHistory([]);
    setAddInput("");
    setDeductInput("");
    setPartsInput("2");
    setDivided(null);
  }

  function handleClickValue(value: number) {
    if (!Number.isFinite(value) || value <= 0) return;
    deductAmount(value);
    const n = Math.trunc(Number(partsInput || "0"));
    const nextN = Math.max(0, n - 1);
    setPartsInput(String(nextN));
    // recalculer immédiatement avec N-1 en se basant sur le restant à jour
    const current = getRemaining();
    const newRemaining = Math.max(0, Number((current - value).toFixed(2)));
    if (nextN <= 0) {
      setDivided([]);
      return;
    }
    divideRemaining(nextN, newRemaining);
  }

  const remaining = useMemo(() => getRemaining(), [history]);

  return (
    <div className="container mx-auto p-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Encaissement
        </h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-sm font-normal">Montant restant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatEUR(remaining)}</div>
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opérations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Montant à ajouter
                </label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 25,50"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const v = toNumber(addInput)
                      if (!Number.isFinite(v) || v <= 0) return
                      addAmount(v)
                      setAddInput('')
                    }
                  }}
                />
              </div>
              <Button type="submit" className="sm:self-end">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </form>

            <form onSubmit={handleDeductSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Montant à déduire
                </label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 10"
                  value={deductInput}
                  onChange={(e) => setDeductInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const v = toNumber(deductInput)
                      if (!Number.isFinite(v) || v <= 0) return
                      deductAmount(v)
                      setDeductInput('')
                    }
                  }}
                />
              </div>
              <Button type="submit" variant="destructive" className="sm:self-end">
                <Minus className="h-4 w-4 mr-2" />
                Déduire
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Diviser en N parts (arrondi au 0,5)
                </label>
                <Input
                  inputMode="numeric"
                  placeholder="Ex: 3"
                  value={partsInput}
                  onChange={(e) => setPartsInput(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <Button 
                onClick={() => {
                  const n = Number(partsInput || '0')
                  if (!Number.isFinite(n) || n <= 0) return setDivided(null)
                  divideRemaining(n)
                }}
                variant="secondary"
                className="sm:self-end"
              >
                <Divide className="h-4 w-4 mr-2" />
                Diviser
              </Button>
            </div>

            {divided && (
              <div className="rounded-lg border bg-muted p-4">
                <div className="mb-2 text-sm font-medium">Parts proposées</div>
                {divided.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun montant à répartir.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const counts = new Map<number, number>()
                      divided.forEach((v: number) => {
                        const key = Number(v.toFixed(2))
                        counts.set(key, (counts.get(key) ?? 0) + 1)
                      })
                      const entries = Array.from(counts.entries()).sort((a, b) => a[0] - b[0])
                      return entries.map(([value, count]) => (
                        <div key={value} className="inline-flex items-center gap-1.5">
                          <Badge variant="outline">{count}×</Badge>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleClickValue(value)}
                            title={`Déduire ${formatEUR(value)}`}
                          >
                            {formatShortEUR(value)}
                          </Button>
                        </div>
                      ))
                    })()}
                  </div>
                )}
                {divided.length > 0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Total des parts: {formatEUR(divided.reduce((s: number, v: number) => s + v, 0))}
                  </div>
                )}
              </div>
            )}

            <Button onClick={resetEncaissement} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucune opération pour le moment.</div>
            ) : (
              <ul className="space-y-2">
                {history.map((h: HistoryItem) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between px-3 py-2 rounded-md border"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={h.type === 'add' ? 'default' : 'destructive'}>
                        {h.type === 'add' ? '+' : '-'}
                      </Badge>
                      <span className="font-medium">{formatEUR(h.amount)}</span>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(h.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
