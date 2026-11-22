# Moja lodówka

Node.js, React/Vite i aplikacja mobilna Expo/React Native.

## Uruchomienie

Wymagany Node.js 20+.

```bash
# backend
cd server
npm install
npm run dev

# aplikacja lodówki
cd client
npm install
npm run dev -- --host

# aplikacja mobilna
cd mobile
npm install
npm start
```

Backend działa domyślnie na porcie `3001`, a frontend przeglądarkowy na `5173`.

## Telefon i wspólna sieć

Uruchom backend tak, aby był dostępny w sieci:

```bash
cd server
npm run dev -- --host
```

W aplikacji mobilnej wpisz adres:

```text
http://IP_KOMPUTERA_W_SIECI:3001
```

Na przykład `http://192.168.1.20:3001`. Telefon i komputer muszą być w tej samej sieci Wi-Fi.

## API

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/catalog` | Kategorie i produkty |
| POST | `/api/catalog/custom` | Dodanie własnego produktu |
| GET | `/api/fridge` | Zawartość lodówki |
| POST | `/api/fridge/items` | Dodanie produktów |
| PATCH | `/api/fridge/items/:id` | Zmiana ilości |
| DELETE | `/api/fridge/items/:id` | Usunięcie pozycji |
| DELETE | `/api/fridge` | Opróżnienie lodówki |
| POST | `/api/receipts/parse` | Analiza tekstu paragonu |
| GET | `/api/recipes` | Lista 15 przepisów |
| GET | `/api/recommendations` | Dwie najlepsze propozycje na dziś |

Rekomendacje łącznie oceniają:

- procent dostępnych składników,
- liczbę brakujących składników,
- najkrótszy termin ważności dostępnych składników,
- priorytet dla produktów kończących się w ciągu 2, 7 lub 14 dni.
