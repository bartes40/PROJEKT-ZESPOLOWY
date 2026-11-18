// Cienka warstwa nad fetch – wszystkie wywołania backendu w jednym miejscu.

async function req(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
  return data;
}

export const api = {
  catalog: () => req('GET', '/catalog'),
  addCustomProduct: (name, cat) => req('POST', '/catalog/custom', { name, cat }),
  fridge: () => req('GET', '/fridge'),
  addItems: (items) => req('POST', '/fridge/items', { items }),
  setQty: (id, qty) => req('PATCH', `/fridge/items/${id}`, { qty }),
  remove: (id) => req('DELETE', `/fridge/items/${id}`),
  clearFridge: () => req('DELETE', '/fridge'),
  parseReceipt: (text) => req('POST', '/receipts/parse', { text }),
};
