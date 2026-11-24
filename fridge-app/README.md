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

## Konto, profil i powiadomienia

W aplikacji mobilnej można założyć konto lub się zalogować. Każde konto ma własną lodówkę, liczbę domowników i preferencje dietetyczne. Przepisy są obiadami; otwórz propozycję, aby zobaczyć składniki i instrukcje. Ilości składników są przeliczane dla liczby osób w profilu.

Codzienne przypomnienia są wysyłane przez Expo Push Service o zapisanej godzinie i w strefie czasowej telefonu. Do ich używania potrzebne są:

1. Projekt Expo/EAS oraz skonfigurowane poświadczenia powiadomień push.
2. Development build aplikacji (Expo Go nie obsługuje push w tym projekcie).
3. Inicjalizacja projektu i build deweloperski:

```powershell
cd mobile
npx eas-cli init
npx eas-cli build --profile development --platform android
npx expo start --dev-client
```

Polecenie `eas init` zapisze identyfikator projektu w konfiguracji, a w panelu Expo należy skonfigurować poświadczenia push. Serwer backendu musi działać, aby wysłać przypomnienie. Hasła są przechowywane jako hashe, a token sesji w bezpiecznym magazynie telefonu.

## API

| Metoda | Ścieżka | Opis |
|---|---|---|
| POST | `/api/auth/register` | Rejestracja użytkownika |
| POST | `/api/auth/login` | Logowanie i wydanie sesji |
| GET | `/api/auth/me` | Profil zalogowanego użytkownika |
| PATCH | `/api/auth/profile` | Zapis preferencji i pory przypomnienia |
| POST | `/api/auth/logout` | Wylogowanie i wyłączenie push na urządzeniu |
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
