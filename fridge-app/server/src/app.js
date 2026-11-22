// Serwer HTTP + routing (node:http, bez zależności).
// Jeśli wolicie Expressa: handlery poniżej przenoszą się niemal 1:1 (ctx.body -> req.body, ctx.params -> req.params).

import http from 'node:http';
import { CATS } from './catalog.js';
import { parseReceipt, matchProduct } from './parser.js';
import { read, write } from './store.js';
import { HttpError, addItems, addCustomProduct, allProducts, sortedFridge, intInRange, popularProducts, quantityInRange } from './fridge.js';
import { RECIPES, getRecommendations } from './recipes.js';

const MAX_BODY = 1_000_000; // 1 MB

const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const re = new RegExp(
    '^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$',
  );
  routes.push({ method, re, keys, handler });
};

/* ---------------- ROUTES ---------------- */

route('GET', '/api/health', async () => ({ ok: true }));

route('GET', '/api/catalog', () =>
  read((s) => ({ categories: CATS, products: allProducts(s).map(({ kw, ...p }) => p), popular: popularProducts(s) })),
);

route('POST', '/api/catalog/custom', ({ body }) =>
  write((s) => {
    const { kw, ...product } = addCustomProduct(s, body);
    return { status: 201, body: { product } };
  }),
);

route('GET', '/api/fridge', () => read((s) => ({ items: sortedFridge(s) })));

route('GET', '/api/recipes', () => ({ recipes: RECIPES }));

route('GET', '/api/recommendations', () =>
  read((s) => ({ recommendations: getRecommendations(sortedFridge(s), 2) })),
);

route('POST', '/api/fridge/items', ({ body }) =>
  write((s) => ({ status: 201, body: { items: addItems(s, body?.items) } })),
);

route('PATCH', '/api/fridge/items/:id', ({ params, body }) =>
  write((s) => {
    const item = s.fridge.find((f) => f.id === params.id);
    if (!item) throw new HttpError(404, 'Nie ma takiej pozycji');
    const unit = body?.unit ?? item.unit ?? 'pcs';
    if (!['pcs', 'g', 'ml'].includes(unit)) throw new HttpError(400, 'unit: oczekiwana jednostka pcs, g lub ml');
    const qty = body?.qty === 0 ? 0 : quantityInRange(body?.qty, unit, 'qty');
    if (qty === 0) s.fridge = s.fridge.filter((f) => f !== item);
    else {
      item.qty = qty;
      item.unit = unit;
    }
    return { item: qty === 0 ? null : item };
  }),
);

route('DELETE', '/api/fridge/items/:id', ({ params }) =>
  write((s) => {
    const before = s.fridge.length;
    s.fridge = s.fridge.filter((f) => f.id !== params.id);
    if (s.fridge.length === before) throw new HttpError(404, 'Nie ma takiej pozycji');
    return { ok: true };
  }),
);

route('DELETE', '/api/fridge', () =>
  write((s) => {
    s.fridge = [];
    return { ok: true };
  }),
);

// Wejście: tekst paragonu (OCR z frontu albo wklejony e-paragon). Wyjście: propozycje do akceptacji.
route('POST', '/api/receipts/parse', ({ body }) =>
  read((s) => {
    const text = body?.text;
    if (typeof text !== 'string' || !text.trim()) throw new HttpError(400, 'text: wymagany niepusty tekst');
    if (text.length > 20_000) throw new HttpError(413, 'text: za długi');
    const catalog = allProducts(s);
    const items = parseReceipt(text).map((p) => {
      const prod = matchProduct(p.name, catalog);
      const cat = prod?.cat ?? 'other';
      return {
        raw: p.name,
        name: prod?.name ?? p.name,
        qty: p.qty,
        cat,
        emoji: prod?.emoji ?? CATS.find((c) => c.id === cat).emoji,
        days: prod?.days ?? 7,
        known: Boolean(prod),
      };
    });
    return { items };
  }),
);

/* ---------------- SERWER ---------------- */

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, 'Za duże żądanie'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve(undefined);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'Niepoprawny JSON'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(data);
}

export function createApp() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, {});
      const { pathname } = new URL(req.url, 'http://localhost');
      let matchedPath = false;
      for (const r of routes) {
        const m = pathname.match(r.re);
        if (!m) continue;
        matchedPath = true;
        if (r.method !== req.method) continue;
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readJson(req) : undefined;
        const out = await r.handler({ params, body });
        return out && out.status ? send(res, out.status, out.body) : send(res, 200, out);
      }
      throw new HttpError(matchedPath ? 405 : 404, matchedPath ? 'Metoda niedozwolona' : 'Nie znaleziono');
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error(err);
      send(res, 500, { error: 'Błąd serwera' });
    }
  });
}
