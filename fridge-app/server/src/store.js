// Prosty magazyn danych w pliku JSON (na potrzeby projektu; łatwo podmienić na SQLite/Mongo).
// Zapisy są serializowane (kolejka) i atomowe (zapis do pliku tymczasowego + rename).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = process.env.DB_FILE || fileURLToPath(new URL('../data/db.json', import.meta.url));

let state = null;
let chain = Promise.resolve();

async function ensureLoaded() {
  if (state) return;
  try {
    state = JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    state = {};
  }
  state.fridge ??= [];
  state.custom ??= [];
  state.usage ??= {};
  for (const item of state.fridge) {
    if (item.unit === 'handful') item.unit = 'ml';
  }
}

async function persist() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2));
  await fs.rename(tmp, FILE);
}

function enqueue(task) {
  const run = chain.then(task);
  chain = run.catch(() => {});
  return run;
}

/** Odczyt: fn(state) -> wynik. Nie zapisuje na dysk. */
export function read(fn) {
  return enqueue(async () => {
    await ensureLoaded();
    return fn(state);
  });
}

/** Zapis: fn(state) może zmieniać stan; po zakończeniu stan trafia na dysk. */
export function write(fn) {
  return enqueue(async () => {
    await ensureLoaded();
    const res = await fn(state);
    await persist();
    return res;
  });
}
