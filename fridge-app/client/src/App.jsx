import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import TilePicker from './components/TilePicker.jsx';
import ReceiptScanner from './components/ReceiptScanner.jsx';
import FridgeList from './components/FridgeList.jsx';

const TABS = [
  ['tiles', 'Kafelki'],
  ['receipt', 'Paragon'],
  ['fridge', 'Lodówka'],
];

export default function App() {
  const [tab, setTab] = useState('tiles');
  const [catalog, setCatalog] = useState({ categories: [], products: [] });
  const [fridge, setFridge] = useState([]);
  const [cart, setCart] = useState({}); // { nazwaProduktu: ilość } – koszyk na kafelkach
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const toastTimer = useRef();

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  }, []);

  const loadCatalog = useCallback(async () => setCatalog(await api.catalog()), []);
  const loadFridge = useCallback(async () => setFridge((await api.fridge()).items), []);

  useEffect(() => {
    Promise.all([loadCatalog(), loadFridge()]).catch((e) =>
      setError(`Nie można połączyć się z serwerem (${e.message}). Czy backend działa na :3001?`),
    );
  }, [loadCatalog, loadFridge]);

  // Wspólna akcja: wyślij pozycje do lodówki i odśwież widok
  const addToFridge = useCallback(
    async (items, okMessage) => {
      try {
        await api.addItems(items);
        await loadFridge();
        notify(okMessage);
        return true;
      } catch (e) {
        notify(`Błąd: ${e.message}`);
        return false;
      }
    },
    [loadFridge, notify],
  );

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  return (
    <>
      <header className="wrap">
        <h1>🧲 Moja lodówka</h1>
      </header>

      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
            {id === 'fridge' && fridge.length > 0 ? ` (${fridge.length})` : ''}
          </button>
        ))}
      </nav>

      <main className="wrap">
        {error && <div className="card error">{error}</div>}

        {tab === 'tiles' && (
          <TilePicker
            catalog={catalog}
            cart={cart}
            onAdd={(name) => setCart((c) => ({ ...c, [name]: (c[name] || 0) + 1 }))}
            onRemove={(name) =>
              setCart((c) => {
                const { [name]: q, ...rest } = c;
                return q > 1 ? { ...rest, [name]: q - 1 } : rest;
              })
            }
            onClear={() => setCart({})}
            onCommit={async () => {
              const items = Object.entries(cart).map(([name, qty]) => ({ name, qty }));
              if (await addToFridge(items, `Dodano ${items.length} produktów do lodówki`)) setCart({});
            }}
            onCreateProduct={async (name, cat) => {
              try {
                await api.addCustomProduct(name, cat);
                await loadCatalog();
                notify('Dodano własny kafelek');
                return true;
              } catch (e) {
                notify(`Błąd: ${e.message}`);
                return false;
              }
            }}
          />
        )}

        {tab === 'receipt' && (
          <ReceiptScanner
            categories={catalog.categories}
            onCommit={(items) => addToFridge(items, `Dodano ${items.length} produktów z paragonu`)}
          />
        )}

        {tab === 'fridge' && (
          <FridgeList
            items={fridge}
            categories={catalog.categories}
            onSetQty={async (id, qty) => {
              await api.setQty(id, qty).catch((e) => notify(`Błąd: ${e.message}`));
              loadFridge();
            }}
            onRemove={async (id) => {
              await api.remove(id).catch((e) => notify(`Błąd: ${e.message}`));
              loadFridge();
            }}
            onClear={async () => {
              if (!window.confirm('Na pewno usunąć wszystko z lodówki?')) return;
              await api.clearFridge();
              loadFridge();
            }}
          />
        )}
      </main>

      {tab === 'tiles' && cartCount > 0 && <div className="spacer" />}
      <div className={`toast ${toast ? 'on' : ''}`}>{toast}</div>
    </>
  );
}
