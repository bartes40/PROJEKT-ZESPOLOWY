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

  const products = useMemo(() => {
    const q = norm(query.trim());
    return catalog.products.filter((p) => (cat === 'all' || p.cat === cat) && (!q || norm(p.name).includes(q)));
  }, [catalog.products, cat, query]);

  const total = Object.values(cart).reduce((s, n) => s + n, 0);

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

      <div className="grid">
        {products.map((p) => {
          const qty = cart[p.name] || 0;
          return (
            <div key={p.name} className={`tile ${qty ? 'sel' : ''}`} onClick={() => onAdd(p.name)}>
              {qty > 0 && (
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
                  <span className="badge">{qty}</span>
                </>
              )}
              <div className="e">{p.emoji}</div>
              <div className="n">{p.name}</div>
            </div>
          );
        })}
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
            <span>W koszyku: {total} szt.</span>
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
    </section>
  );
}
