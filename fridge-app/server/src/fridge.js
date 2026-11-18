// Logika domenowa lodówki: walidacja i dodawanie produktów.

import { CATS, CATALOG } from './catalog.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const CAT_IDS = new Set(CATS.map((c) => c.id));

export function isoDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; // data lokalna serwera
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function intInRange(v, min, max, label) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${label}: oczekiwana liczba całkowita ${min}–${max}`);
  }
  return n;
}

export function allProducts(state) {
  return [...CATALOG, ...state.custom];
}

/**
 * Waliduje wejście i dodaje pozycje do lodówki.
 * Brakujące pola (emoji, kategoria, ważność) są uzupełniane z katalogu.
 * Identyczny produkt z tą samą datą ważności jest scalany (qty rośnie).
 */
export function addItems(state, rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 200) {
    throw new HttpError(400, 'items: oczekiwana niepusta lista (max 200)');
  }
  // najpierw cała walidacja, potem mutacja – błędne żądanie nie zostawia połowicznego stanu
  const ready = rawItems.map((it) => {
    const name = typeof it?.name === 'string' ? it.name.trim() : '';
    if (!name || name.length > 80) throw new HttpError(400, 'name: wymagany tekst 1–80 znaków');
    const prod = allProducts(state).find((p) => p.name === name);
    const qty = intInRange(it.qty ?? 1, 1, 999, 'qty');
    const days = intInRange(it.days ?? prod?.days ?? 7, 0, 3650, 'days');
    const cat = it.cat ?? prod?.cat ?? 'other';
    if (!CAT_IDS.has(cat)) throw new HttpError(400, `cat: nieznana kategoria "${cat}"`);
    const emoji = it.emoji ?? prod?.emoji ?? CATS.find((c) => c.id === cat).emoji;
    return { name, qty, days, cat, emoji: String(emoji).slice(0, 8) };
  });

  const added = [];
  for (const r of ready) {
    const expires = addDays(r.days);
    const same = state.fridge.find((f) => f.name === r.name && f.expires === expires);
    if (same) {
      same.qty += r.qty;
      added.push(same);
    } else {
      const item = {
        id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name: r.name,
        emoji: r.emoji,
        cat: r.cat,
        qty: r.qty,
        added: isoDate(new Date()),
        expires,
      };
      state.fridge.push(item);
      added.push(item);
    }
  }
  return added;
}

export function sortedFridge(state) {
  return [...state.fridge].sort((a, b) => a.expires.localeCompare(b.expires) || a.name.localeCompare(b.name, 'pl'));
}

export function addCustomProduct(state, body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 80) throw new HttpError(400, 'name: wymagany tekst 1–80 znaków');
  const cat = body.cat ?? 'other';
  if (!CAT_IDS.has(cat)) throw new HttpError(400, `cat: nieznana kategoria "${cat}"`);
  if (allProducts(state).some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    throw new HttpError(409, 'Taki produkt już istnieje');
  }
  const days = intInRange(body.days ?? 7, 0, 3650, 'days');
  const emoji = CATS.find((c) => c.id === cat).emoji;
  const prod = { name, emoji, cat, days, kw: [name.toLowerCase()], custom: true };
  state.custom.push(prod);
  return prod;
}

export { intInRange };
