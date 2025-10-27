"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

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
    <main className="min-h-dvh w-full bg-black text-white">
      <div className="mx-auto w-full max-w-screen-sm px-4 py-5 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Encaissement</h1>

        <div className="mt-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-[0.99]"
          >
            Accueil
          </Link>
        </div>

        <section className="mt-3 rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Montant restant</div>
          <div className="mt-1 text-3xl font-extrabold">{formatEUR(remaining)}</div>
        </section>

        <section className="mt-5 space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm sm:mt-6 sm:p-5">
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Montant à ajouter (initial ou supplémentaire)
              </span>
              <input
                inputMode="decimal"
                step="0.01"
                placeholder="Ex: 25,50"
                value={addInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddInput(e.target.value)}
                enterKeyHint="done"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = toNumber(addInput);
                    if (!Number.isFinite(v) || v <= 0) return;
                    addAmount(v);
                    setAddInput("");
                  }
                }}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 px-4 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-600/40"
              />
            </label>
            <button
              type="submit"
              className="h-12 rounded-xl bg-gray-900 px-5 text-base font-semibold text-white active:scale-[0.99] sm:self-end sm:h-[52px]"
            >
              Ajouter
            </button>
          </form>

          <form onSubmit={handleDeductSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-gray-300">Montant à déduire</span>
              <input
                inputMode="decimal"
                step="0.01"
                placeholder="Ex: 10"
                value={deductInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeductInput(e.target.value)}
                enterKeyHint="done"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = toNumber(deductInput);
                    if (!Number.isFinite(v) || v <= 0) return;
                    deductAmount(v);
                    setDeductInput("");
                  }
                }}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 px-4 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-600/40"
              />
            </label>
            <button
              type="submit"
              className="h-12 rounded-xl bg-red-600 px-5 text-base font-semibold text-white active:scale-[0.99] sm:self-end sm:h-[52px]"
            >
              Déduire
            </button>
          </form>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-end gap-3">
              <label className="flex-1">
                <span className="mb-2 block text-sm font-medium text-gray-300">
                  Diviser en N parts (arrondies au 0,5 supérieur)
                </span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ex: 3"
                  value={partsInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartsInput(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 px-4 py-3 text-base outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-600/40"
                />
              </label>
              <button
                onClick={() => {
                  const n = Number(partsInput || "0");
                  if (!Number.isFinite(n) || n <= 0) return setDivided(null);
                  divideRemaining(n);
                }}
                className="h-12 rounded-xl bg-blue-600 px-5 text-base font-semibold text-white active:scale-[0.99] sm:h-[52px]"
              >
                Diviser
              </button>
            </div>
          </div>

          {divided && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="mb-2 text-sm font-medium text-gray-300">Parts proposées</div>
              {divided.length === 0 ? (
                <div className="text-sm text-gray-400">Aucun montant à répartir.</div>
              ) : (
                <div className="flex flex-wrap gap-2 text-base font-semibold text-gray-100">
                  {(() => {
                    const counts = new Map<number, number>();
                    divided.forEach((v: number) => {
                      const key = Number(v.toFixed(2));
                      counts.set(key, (counts.get(key) ?? 0) + 1);
                    });
                    const entries = Array.from(counts.entries()).sort((a, b) => a[0] - b[0]);
                    return entries.map(([value, count]) => (
                      <div key={value} className="inline-flex items-center gap-1.5">
                        <span className="text-gray-300">{count}*</span>
                        <button
                          type="button"
                          onClick={() => handleClickValue(value)}
                          className="inline-flex items-center rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-[0.99] cursor-pointer transition"
                          title={`Déduire ${formatEUR(value)}`}
                        >
                          {formatShortEUR(value)}
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              )}
              {divided.length > 0 && (
                <div className="mt-3 text-sm text-gray-400">
                  Total des parts: {formatEUR(divided.reduce((s: number, v: number) => s + v, 0))}
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={resetEncaissement}
              className="w-full h-12 rounded-xl bg-gray-700 px-5 text-base font-semibold text-white active:scale-[0.99]"
            >
              Réinitialiser l'encaissement
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm sm:p-5">
          <div className="mb-3 text-base font-semibold">Historique de l'encaissement</div>
          {history.length === 0 ? (
            <div className="text-sm text-gray-400">Aucune opération pour le moment.</div>
          ) : (
            <ul className="space-y-2">
              {history.map((h: HistoryItem) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        h.type === "add"
                          ? "inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700"
                          : "inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 font-medium text-red-700"
                      }
                    >
                      {h.type === "add" ? "+" : "-"}
                    </span>
                    <span className="font-medium">{formatEUR(h.amount)}</span>
                  </div>
                  <time className="text-xs text-gray-500">
                    {new Date(h.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
