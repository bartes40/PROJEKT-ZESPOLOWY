import { useMemo, useState } from 'react';

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function TilePicker({ catalog, cart, onAdd, onRemove, onClear, onCommit, onCreateProduct }) {
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState('other');
  const [amountProduct, setAmountProduct] = useState(null);
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('pcs');

  const products = useMemo(() => {
    const q = norm(query.trim());
    return catalog.products.filter((p) => (cat === 'all' || p.cat === cat) && (!q || norm(p.name).includes(q)));
  }, [catalog.products, cat, query]);

  const total = Object.keys(cart).length;
  const popular = (catalog.popular ?? [])
    .map((name) => catalog.products.find((p) => p.name === name))
    .filter(Boolean);

  function openAmount(product) {
    const selected = cart[product.name];
    setAmountProduct(product);
    setAmount(selected ? String(selected.qty) : '1');
    setUnit(selected ? selected.unit : 'pcs');
  }

  function confirmAmount() {
    const qty = Number(amount);
    if (!amountProduct || !Number.isFinite(qty) || qty <= 0) return;
    if (unit === 'pcs' && !Number.isInteger(qty)) return;
    onAdd(amountProduct.name, qty, unit);
    setAmountProduct(null);
  }

  function renderTile(p) {
    const selected = cart[p.name];
    return (
      <div key={p.name} className={`tile ${selected ? 'sel' : ''}`} onClick={() => openAmount(p)}>
        {selected && (
          <>
            <button
              className="minus"
              aria-label={`Odejmij ${p.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(p.name);
              }}
            >
              −
            </button>
            <span className="badge">
              {selected.qty}
              {selected.unit === 'g' ? ' g' : selected.unit === 'ml' ? ' ml' : ''}
            </span>
          </>
        )}
        <div className="e">{p.emoji}</div>
        <div className="n">{p.name}</div>
      </div>
    );
  }

  return (
    <section>
      <input
        type="text"
        placeholder="Szukaj produktu…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="chips">
        <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
          ⭐ Wszystkie
        </button>
        {catalog.categories.map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {popular.length > 0 && cat === 'all' && !query.trim() && (
        <div className="frequent">
          <b>Najczęściej wybierane</b>
          <div className="grid frequent-grid">{popular.map(renderTile)}</div>
        </div>
      )}

      <div className="grid">
        {products.map(renderTile)}
        {products.length === 0 && <p className="muted">Brak wyników – dodaj własny produkt poniżej.</p>}
      </div>

      <div className="card">
        <b>Nie ma na liście?</b>
        <div className="row" style={{ marginTop: 8 }}>
          <input
            type="text"
            placeholder="Nazwa produktu"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <select value={customCat} onChange={(e) => setCustomCat(e.target.value)} style={{ maxWidth: 170 }}>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn sec"
          style={{ marginTop: 8 }}
          disabled={!customName.trim()}
          onClick={async () => {
            if (await onCreateProduct(customName.trim(), customCat)) {
              setCustomName('');
              setCat(customCat);
            }
          }}
        >
          + Dodaj własny kafelek
        </button>
      </div>

      {total > 0 && (
        <div className="bar">
          <div>
            <span>W koszyku: {total} {total === 1 ? 'produkt' : 'produkty'}</span>
            <span className="row">
              <button className="btn sec" onClick={onClear}>
                Wyczyść
              </button>
              <button className="btn" onClick={onCommit}>
                Dodaj do lodówki
              </button>
            </span>
          </div>
        </div>
      )}

      {amountProduct && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAmountProduct(null)}>
          <div className="amount-modal" role="dialog" aria-modal="true" aria-label={`Ilość: ${amountProduct.name}`} onMouseDown={(e) => e.stopPropagation()}>
            <div className="amount-title">
              <span className="e">{amountProduct.emoji}</span>
              <b>{amountProduct.name}</b>
            </div>
            <label>Ile?</label>
            <input
              type="number"
              min="1"
              step={unit === 'g' ? '1' : '1'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <div className="unit-picker" aria-label="Jednostka">
              <button className={unit === 'pcs' ? 'on' : ''} onClick={() => setUnit('pcs')}>sztuki</button>
              <button className={unit === 'g' ? 'on' : ''} onClick={() => setUnit('g')}>gramy</button>
              <button className={unit === 'ml' ? 'on' : ''} onClick={() => setUnit('ml')}>ml</button>
            </div>
            <div className="row modal-actions">
              <button className="btn sec" onClick={() => setAmountProduct(null)}>Anuluj</button>
              <button className="btn" onClick={confirmAmount}>Dodaj</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
