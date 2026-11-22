// Ile dni zostało do daty ważności (YYYY-MM-DD), liczone w czasie lokalnym użytkownika.
function daysLeft(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

function label(d) {
  if (d < 0) return `po terminie (${-d} dn.)`;
  if (d === 0) return 'dziś';
  if (d === 1) return 'jutro';
  return `${d} dni`;
}

function qtyLabel(qty, unit) {
  if (unit === 'g') return `${qty} g`;
  if (unit === 'ml') return `${qty} ml`;
  return `× ${qty}`;
}

export default function FridgeList({ items, categories, onSetQty, onRemove, onClear }) {
  const catName = (id) => categories.find((c) => c.id === id)?.name ?? 'Inne';

  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lodowka.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <section>
      {items.length === 0 ? (
        <div className="card muted">Lodówka jest pusta. Dodaj produkty z kafelków lub z paragonu.</div>
      ) : (
        <div className="card list">
          {items.map((f) => {
            const d = daysLeft(f.expires);
            const cls = d < 0 ? 'bad' : d <= 2 ? 'warn' : '';
            return (
              <div className="item" key={f.id}>
                <div className="e">{f.emoji}</div>
                <div className="t">
                  <div>
                    {f.name} <span className="muted">{qtyLabel(f.qty, f.unit ?? 'pcs')}</span>
                  </div>
                  <span className={`tag ${cls}`}>{label(d)}</span> <span className="muted">{catName(f.cat)}</span>
                </div>
                <button className="sm" aria-label="Mniej" onClick={() => onSetQty(f.id, f.qty - 1)}>
                  −
                </button>
                <button className="sm" aria-label="Więcej" onClick={() => onSetQty(f.id, f.qty + 1)}>
                  +
                </button>
                <button className="sm" aria-label="Usuń" onClick={() => onRemove(f.id)}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="row wrapRow" style={{ marginTop: 14 }}>
        <button className="btn sec" disabled={!items.length} onClick={exportJson}>
          Eksportuj JSON
        </button>
        <button className="btn sec" disabled={!items.length} onClick={onClear}>
          Wyczyść lodówkę
        </button>
      </div>
      <p className="muted">Eksport JSON to dane wejściowe dla modułu, który dobiera przepisy.</p>
    </section>
  );
}
