import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// Osobny plik bazy dla testów – ustawiamy ZANIM załadujemy moduły serwera.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fridge-test-'));
process.env.DB_FILE = path.join(dir, 'db.json');
const { createApp } = await import('../src/app.js');
const { sendDueReminders } = await import('../src/auth.js');

const server = createApp();
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/api`;

const call = async (method, p, body, token) => {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + p, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

test.after(() => {
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('katalog zawiera kategorie i produkty', async () => {
  const { status, data } = await call('GET', '/catalog');
  assert.equal(status, 200);
  assert.ok(data.categories.length >= 10);
  assert.ok(data.products.some((p) => p.name === 'Mleko'));
  assert.equal(data.products[0].kw, undefined);
});

test('dodawanie z kafelków uzupełnia domyślną ważność i scala duplikaty', async () => {
  let r = await call('POST', '/fridge/items', { items: [{ name: 'Mleko', qty: 2 }] });
  assert.equal(r.status, 201);
  r = await call('POST', '/fridge/items', { items: [{ name: 'Mleko', qty: 1 }, { name: 'Chleb', qty: 1 }] });
  assert.equal(r.status, 201);
  const f = await call('GET', '/fridge');
  const milk = f.data.items.find((i) => i.name === 'Mleko');
  assert.equal(milk.qty, 3);
  assert.equal(milk.emoji, '🥛');
  assert.equal(f.data.items[0].name, 'Chleb'); // sortowanie po terminie ważności (chleb 4 dni < mleko 7)
});

test('ilość obsługuje jednostki i częstotliwość trafia do popularnych', async () => {
  let r = await call('POST', '/fridge/items', {
    items: [{ name: 'Ryż', qty: 250, unit: 'g' }, { name: 'Ryż', qty: 250, unit: 'g' }],
  });
  assert.equal(r.status, 201);
  r = await call('POST', '/fridge/items', { items: [{ name: 'Ryż', qty: 250, unit: 'ml' }] });
  assert.equal(r.status, 201);

  const f = await call('GET', '/fridge');
  assert.ok(f.data.items.some((i) => i.name === 'Ryż' && i.unit === 'g' && i.qty === 500));
  assert.ok(f.data.items.some((i) => i.name === 'Ryż' && i.unit === 'ml' && i.qty === 250));

  r = await call('GET', '/catalog');
  assert.ok(r.data.popular.includes('Ryż'));
  assert.equal((await call('POST', '/fridge/items', { items: [{ name: 'Ryż', qty: 1.5, unit: 'pcs' }] })).status, 400);
});

test('walidacja: zła ilość i nieznana kategoria', async () => {
  assert.equal((await call('POST', '/fridge/items', { items: [{ name: 'X', qty: 0 }] })).status, 400);
  assert.equal((await call('POST', '/fridge/items', { items: [{ name: 'X', cat: 'nope' }] })).status, 400);
  assert.equal((await call('POST', '/fridge/items', { items: [] })).status, 400);
});

test('PATCH zmienia ilość, qty=0 usuwa, DELETE usuwa', async () => {
  const { data } = await call('GET', '/fridge');
  const bread = data.items.find((i) => i.name === 'Chleb');
  let r = await call('PATCH', `/fridge/items/${bread.id}`, { qty: 5 });
  assert.equal(r.data.item.qty, 5);
  r = await call('PATCH', `/fridge/items/${bread.id}`, { qty: 0 });
  assert.equal(r.data.item, null);
  assert.equal((await call('DELETE', `/fridge/items/${bread.id}`)).status, 404);
});

test('parsowanie paragonu zwraca dopasowane produkty', async () => {
  const text = 'Mleko UHT 3,2% 1L 2 x 3,49 6,98 C\nDziwny Produkt XYZ 5,99 B\nSUMA PLN 12,97';
  const r = await call('POST', '/receipts/parse', { text });
  assert.equal(r.status, 200);
  assert.equal(r.data.items[0].name, 'Mleko');
  assert.equal(r.data.items[0].qty, 2);
  assert.equal(r.data.items[0].known, true);
  assert.equal(r.data.items[1].known, false);
  assert.equal(r.data.items[1].cat, 'other');
  assert.equal((await call('POST', '/receipts/parse', { text: '  ' })).status, 400);
});

test('własny produkt: dodanie, dopasowanie z paragonu, duplikat', async () => {
  let r = await call('POST', '/catalog/custom', { name: 'Tofu', cat: 'dairy' });
  assert.equal(r.status, 201);
  assert.equal((await call('POST', '/catalog/custom', { name: 'tofu', cat: 'dairy' })).status, 409);
  r = await call('POST', '/receipts/parse', { text: 'Tofu naturalne 1 x 6,99 6,99 C' });
  assert.equal(r.data.items[0].name, 'Tofu');
  assert.equal(r.data.items[0].known, true);
});

test('nieznana trasa i zła metoda', async () => {
  assert.equal((await call('GET', '/nic')).status, 404);
  assert.equal((await call('PUT', '/fridge')).status, 405);
});

test('baza przepisów i rekomendacje zwracają dokładnie dwie opcje', async () => {
  const recipes = await call('GET', '/recipes');
  assert.equal(recipes.status, 200);
  assert.equal(recipes.data.recipes.length, 15);
  assert.ok(recipes.data.recipes.every((recipe) => recipe.ingredients.every((ingredient) =>
    typeof ingredient.name === 'string' && typeof ingredient.amount === 'number' && typeof ingredient.unit === 'string')));
  assert.ok(recipes.data.recipes.every((recipe) => recipe.steps.length > 0));
  assert.ok(!recipes.data.recipes.some((recipe) => /kanapk|tost|owsiank|naleśnik/i.test(recipe.name)));

  const recommendations = await call('GET', '/recommendations');
  assert.equal(recommendations.status, 200);
  assert.equal(recommendations.data.recommendations.length, 2);
  assert.ok(recommendations.data.recommendations[0].matched.length >= 0);
});

test('konta mają osobne lodówki i rekomendacje respektują dietę', async () => {
  const registered = await call('POST', '/auth/register', {
    email: 'osoba@example.com',
    password: 'bezpieczne-haslo',
  });
  assert.equal(registered.status, 201);
  const token = registered.data.token;
  assert.equal((await call('POST', '/auth/register', {
    email: 'osoba@example.com',
    password: 'bezpieczne-haslo',
  })).status, 409);

  const legacyFridgeCount = (await call('GET', '/fridge')).data.items.length;
  assert.equal((await call('POST', '/fridge/items', {
    items: [{ name: 'Ryż', qty: 1 }],
  }, token)).status, 201);
  assert.equal((await call('GET', '/fridge', undefined, token)).data.items.length, 1);
  assert.equal((await call('GET', '/fridge')).data.items.length, legacyFridgeCount);

  const profile = await call('PATCH', '/auth/profile', {
    familySize: 4,
    diet: ['vegan'],
    notificationTime: '18:30',
    timezone: 'Europe/Warsaw',
    expoPushToken: 'ExponentPushToken[test-device]',
  }, token);
  assert.equal(profile.status, 200);
  assert.equal(profile.data.familySize, 4);
  assert.equal(profile.data.expoPushToken, undefined);
  assert.equal(profile.data.notificationsEnabled, true);
  const recommendations = await call('GET', '/recommendations', undefined, token);
  assert.ok(recommendations.data.recommendations.every((recipe) => recipe.diets.includes('vegan')));

  const originalFetch = globalThis.fetch;
  let pushCount = 0;
  globalThis.fetch = async () => {
    pushCount += 1;
    return new Response(JSON.stringify({ data: { status: 'ok' } }), { status: 200 });
  };
  try {
    const sent = await sendDueReminders(new Date('2026-01-15T17:31:00.000Z'));
    assert.equal(sent.length, 1);
    assert.equal(pushCount, 1);
    assert.deepEqual(await sendDueReminders(new Date('2026-01-15T17:31:30.000Z')), []);
    assert.equal(pushCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal((await call('GET', '/auth/me')).status, 401);
  assert.equal((await call('POST', '/auth/logout', {}, token)).status, 200);
  assert.equal((await call('GET', '/fridge', undefined, token)).status, 401);
  const loggedIn = await call('POST', '/auth/login', {
    email: 'osoba@example.com',
    password: 'bezpieczne-haslo',
  });
  assert.equal(loggedIn.status, 200);
  const restoredProfile = await call('GET', '/auth/me', undefined, loggedIn.data.token);
  assert.equal(restoredProfile.data.notificationsEnabled, false);
});
