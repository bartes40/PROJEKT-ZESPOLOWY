import { useState } from 'react';
import { api } from '../api.js';

// Przepływ: zdjęcie -> OCR w przeglądarce (tesseract.js) -> tekst -> backend parsuje -> użytkownik weryfikuje -> dodanie.
// Tekst można też wkleić ręcznie (np. e-paragon), wtedy OCR jest pomijany.

const DEMO = `BIEDRONKA
NIP 779-10-11-327
PARAGON FISKALNY
Mleko UHT 3,2% 1L   2 x 3,49   6,98 C
Chleb wiejski 1 x 4,99 4,99 C
Pomidory malinowe 0,456 x 14,99 6,83 C
Jajka M 10szt
1 x 8,99 8,99 C
Pierś z kurczaka 0,712 x 24,99 17,79 C
Makaron penne 500g 1 x 4,29 4,29 C
Reklamówka 1 x 0,20 0,20 A
SUMA PLN 43,16
KARTA 43,16`;

export default function ReceiptScanner({ categories, onCommit }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(null); // null = ukryty pasek
  const [rows, setRows] = useState(null); // null = jeszcze nie analizowano

  async function runOcr(file) {
    if (!file) return;
    setProgress(0);
    setStatus('Ładowanie OCR i rozpoznawanie tekstu…');
    try {
      // dynamiczny import – biblioteka OCR (kilka MB) ładuje się dopiero przy pierwszym skanie
      const { default: Tesseract } = await import('tesseract.js');
      const { data } = await Tesseract.recognize(file, 'pol', {
        logger: (m) => m.status === 'recognizing text' && setProgress(m.progress),
      });
      setText(data.text);
      setStatus('Gotowe – sprawdzam produkty…');
      await analyze(data.text);
      setStatus('Gotowe. Sprawdź listę poniżej.');
    } catch (e) {
      setStatus(`Nie udało się odczytać zdjęcia: ${e.message}`);
    } finally {
      setProgress(null);
    }
  }

  async function analyze(t = text) {
    try {
      const { items } = await api.parseReceipt(t);
      setRows(items.map((i) => ({ ...i, keep: true })));
    } catch (e) {
      setStatus(`Błąd analizy: ${e.message}`);
    }
  }

  const patch = (i, fields) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...fields } : r)));

  async function commit() {
    const items = rows
      .filter((r) => r.keep && r.name.trim())
      .map((r) => ({ name: r.name.trim(), qty: r.qty, cat: r.cat, days: r.days, emoji: r.emoji }));
    if (items.length && (await onCommit(items))) {
      setRows(null);
      setText('');
      setStatus('');
    }
  }

  return (
    <section>
      <div className="card">
        <b>1. Zrób zdjęcie paragonu</b>
        <p className="muted">
          Połóż paragon na płasko, w dobrym świetle, zdjęcie z góry. OCR działa w przeglądarce (przy pierwszym
          użyciu pobiera model języka polskiego, więc potrzebny jest internet).
        </p>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => runOcr(e.target.files[0])} />
        {progress !== null && (
          <div className="prog">
            <i style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
        {status && <div className="muted">{status}</div>}
      </div>

      <div className="card">
        <b>2. Rozpoznany tekst</b>
        <p className="muted">Możesz go poprawić albo wkleić ręcznie (np. z e‑paragonu).</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Tu pojawi się tekst z paragonu…" />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" disabled={!text.trim()} onClick={() => analyze()}>
            Analizuj paragon
          </button>
          <button
            className="btn sec"
            onClick={() => {
              setText(DEMO);
              analyze(DEMO);
            }}
          >
            Wstaw przykład
          </button>
        </div>
      </div>

      {rows && (
        <div className="card">
          <b>3. Sprawdź produkty</b>
          <p className="muted">Odznacz to, czego nie chcesz dodawać, popraw nazwy, ilości i kategorie.</p>
          {rows.length === 0 && <p className="muted">Nie znaleziono pozycji. Popraw tekst i spróbuj ponownie.</p>}
          {rows.map((r, i) => (
            <div className="rev" key={i}>
              <input type="checkbox" checked={r.keep} onChange={(e) => patch(i, { keep: e.target.checked })} />
              <input type="text" value={r.name} onChange={(e) => patch(i, { name: e.target.value })} />
              <input
                type="number"
                min="1"
                value={r.qty}
                onChange={(e) => patch(i, { qty: Math.max(1, Number(e.target.value) || 1) })}
              />
              <div className="sub">
                <select
                  value={r.cat}
                  onChange={(e) =>
                    patch(i, { cat: e.target.value, emoji: categories.find((c) => c.id === e.target.value)?.emoji })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={r.days}
                  title="Ważność w dniach"
                  style={{ width: 84 }}
                  onChange={(e) => patch(i, { days: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
              <div className="muted full">
                {r.known ? '✔ rozpoznano' : '❓ nieznany – sprawdź kategorię'} · z paragonu: {r.raw}
              </div>
            </div>
          ))}
          {rows.length > 0 && (
            <button className="btn" style={{ marginTop: 12 }} onClick={commit}>
              Dodaj zaznaczone do lodówki
            </button>
          )}
        </div>
      )}
    </section>
  );
}
