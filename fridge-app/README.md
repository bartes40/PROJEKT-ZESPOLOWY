<<<<<<< HEAD
# Moja lodówka – dodawanie produktów (kafelki + paragon)

Node.js (backend) + React/Vite (frontend).

```
fridge-app/
├── server/   API (node:http, bez zewnętrznych zależności)
│   ├── src/catalog.js   katalog produktów i kategorie
│   ├── src/parser.js    parser tekstu paragonu + dopasowanie do katalogu
│   ├── src/fridge.js    walidacja i dodawanie produktów
│   ├── src/store.js     zapis stanu do data/db.json
│   ├── src/app.js       routing REST
│   └── test/            testy (node:test)
└── client/   React + Vite
    └── src/components/  TilePicker, ReceiptScanner, FridgeList
```

## Uruchomienie

Wymagany Node.js 20+. W dwóch terminalach:

```bash
# 1) backend  (http://localhost:3001)
cd server
npm run dev

# 2) frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

Testy backendu: `cd server && npm test`.

Żeby otworzyć aplikację na telefonie (ta sama sieć Wi‑Fi): `npm run dev -- --host` w `client/`
i wejść na adres IP komputera. Aparat (`capture`) działa na telefonie bez HTTPS tylko na localhost,
więc do testów skanu zdjęć najprościej wybierać zdjęcie z galerii.

## API

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/catalog` | kategorie + produkty (katalog i własne) |
| POST | `/api/catalog/custom` | `{name, cat}` – własny kafelek |
| GET | `/api/fridge` | zawartość lodówki, posortowana po terminie ważności |
| POST | `/api/fridge/items` | `{items:[{name, qty, days?, cat?, emoji?}]}` – braki uzupełniane z katalogu |
| PATCH | `/api/fridge/items/:id` | `{qty}` (0 = usuń) |
| DELETE | `/api/fridge/items/:id` | usuń pozycję |
| DELETE | `/api/fridge` | opróżnij lodówkę |
| POST | `/api/receipts/parse` | `{text}` → propozycje produktów do zatwierdzenia |

Przykład pozycji w lodówce (to jest też wejście dla modułu dobierającego przepisy):

```json
{ "id": "m3x9k2ab", "name": "Mleko", "emoji": "🥛", "cat": "dairy", "qty": 2,
  "added": "2026-11-16", "expires": "2026-11-23" }
```

## Jak działa skan paragonu

1. Zdjęcie → OCR w przeglądarce (`tesseract.js`, język `pol`).
2. Tekst → `POST /api/receipts/parse` → parser wyciąga linie z produktami (pomija sumy, NIP, torby itd.)
   i dopasowuje je do katalogu po słowach kluczowych.
3. Użytkownik widzi listę do weryfikacji (nazwa, ilość, kategoria, ważność) i dopiero wtedy zatwierdza.

Parser dobrze radzi sobie z typowym formatem `Nazwa 2 x 3,49 6,98 C` oraz z nazwą i ilością w osobnych liniach.
Towary na wagę (`0,456 x 14,99`) liczone są jako 1 szt.

## Znane ograniczenia / pomysły na dalej

- Dane są wspólne dla wszystkich (brak kont użytkowników) i trzymane w pliku JSON – do podmiany na SQLite/Postgres.
- Katalog ma ok. 55 produktów; słowa kluczowe dopasowują się tylko do tego, co w nim jest.
  Nierozpoznane pozycje trafiają do „Inne” i użytkownik poprawia je ręcznie.
- Daty ważności to wartości domyślne z katalogu, a nie z opakowania.
- Skan kodów kreskowych (np. Open Food Facts) jako trzeci sposób dodawania produktów.
- OCR można przenieść na serwer (np. `tesseract.js` w Node), jeśli telefony będą za wolne.
=======
# fridge-app
>>>>>>> d429f19d753cbf6c51ab30ba1096fd9f0e235bc6
