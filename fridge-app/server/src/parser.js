// Parser tekstu paragonu (wynik OCR albo wklejony e-paragon) -> lista produktów.
// Czysty moduł, bez zależności i bez I/O, dzięki czemu łatwo go testować.

export function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Linie, które nie są produktami (nagłówki, sumy, formy płatności, nazwy sklepów...)
const SKIP_LINE =
  /^(suma|razem|sprzed|ptu|podatek|nip|paragon|got[oó]wk|karta|reszta|rabat|do zap|zap[lł]acon|data|nr |kasa|kasjer|ul\.|ul |dzi[eę]kuj|numer|sklep|www|tel|vat|warto[sś][cć]|opakowan|punkty|bon |oszcz|biedronka|lidl|[zż]abka|kaufland|auchan|carrefour|dino|netto|stokrotka|fiskaln|niefiskaln|[-=*_#.]{3,})/i;

// Pozycje, które nie są jedzeniem
const NONFOOD = /torba|reklam|siatk|woreczek|kaucj|zwrot|zgrzewk/;

const NUM = '\\d+(?:[.,]\\d+)?';
const PRICE = '\\d+[.,]\\d{2}';
// "Mleko 3,2% 1L   2 x 3,49   6,98 C"
const RE_FULL = new RegExp(`^(.*?)\\s+(${NUM})\\s*[xX*×]\\s*${PRICE}\\s+-?${PRICE}\\s*[A-Ga-g]?$`);
// "1 x 8,99 8,99 C" (nazwa w poprzedniej linii)
const RE_QTY = new RegExp(`^(${NUM})\\s*[xX*×]\\s*${PRICE}\\s+-?${PRICE}\\s*[A-Ga-g]?$`);
// "Pomidory krojone 400g 3,29 C"
const RE_TOTAL = new RegExp(`^(.*?)\\s+${PRICE}\\s*[A-Ga-g]?$`);

function cleanName(n) {
  return n
    .replace(/^\d{4,}\s+/, '') // kod produktu na początku
    .replace(/[|_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Ilości ułamkowe (towar ważony, np. 0,456 kg) traktujemy jako 1 sztukę.
function toQty(s) {
  const v = parseFloat(String(s).replace(',', '.'));
  return Number.isInteger(v) && v > 0 && v < 100 ? v : 1;
}

/** @returns {{name: string, qty: number}[]} */
export function parseReceipt(text) {
  const out = [];
  let pending = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (SKIP_LINE.test(line)) {
      pending = null;
      continue;
    }
    let m;
    if ((m = line.match(RE_FULL))) {
      out.push({ name: cleanName(m[1]), qty: toQty(m[2]) });
      pending = null;
      continue;
    }
    if (pending && (m = line.match(RE_QTY))) {
      out.push({ name: pending, qty: toQty(m[1]) });
      pending = null;
      continue;
    }
    if ((m = line.match(RE_TOTAL))) {
      out.push({ name: cleanName(m[1]), qty: 1 });
      pending = null;
      continue;
    }
    pending = /[a-zA-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż]{3,}/.test(line) ? cleanName(line) : null;
  }
  return out.filter((i) => i.name.length > 1 && !NONFOOD.test(norm(i.name)));
}

/** Dopasowuje nazwę z paragonu do produktu z katalogu (wygrywa najdłuższe słowo kluczowe). */
export function matchProduct(name, catalog) {
  const n = ` ${norm(name)} `;
  let best = null;
  let bestLen = 0;
  for (const p of catalog) {
    for (const k of p.kw) {
      const kk = k.trim();
      if (!kk) continue;
      const whole = k.endsWith(' ');
      const hit = whole ? n.includes(` ${kk} `) : n.includes(` ${kk}`);
      if (hit && kk.length > bestLen) {
        best = p;
        bestLen = kk.length;
      }
    }
  }
  return best;
}
