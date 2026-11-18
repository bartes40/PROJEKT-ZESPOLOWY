# Profil Idealnego Inwestora (IIP – Ideal Investor Profile)

Projekt stacji kuchennej i aplikacji to hybrydowy model **Hardware-Enabled SaaS** (urządzenie fizyczne IoT w kuchni jako punkt wejścia do subskrypcji i usług cyfrowych).

Dla funduszy czysto software'owych produkcja sprzętu bywa postrzegana jako ryzyko logistyczne. Dlatego docelowy inwestor musi rozumieć, że tanie urządzenie na lodówce (BOM poniżej 70–80 zł) to przede wszystkim narzędzie budowania wysokiej retencji użytkownika, którego nie da się osiągnąć samą aplikacją mobilną.

---

## 1. Kategorie Inwestorów i Tezy Inwestycyjne

### 1.1. Fundusze VC: FoodTech / AgriFood / Sustainability (Impact Investing)
* **Dlaczego ten projekt:** Szukają rozwiązań ograniczających marnowanie żywności bezpośrednio w gospodarstwach domowych, gdzie zawodzi tradycyjna edukacja konsumencka.
* **Twarde dane rynkowe:**
  * W Polsce marnuje się 4,84 mln ton żywności rocznie, z czego aż 60% przypada na konsumentów domowych (dane projektu PROM).
  * 84,5% Polaków przyznaje się do wyrzucania jedzenia z powodu braku pomysłu na zagospodarowanie resztek. Urządzenie podpowiadające przepisy ze stanu lodówki uderza bezpośrednio w to wąskie gardło.

---

### 1.2. Inwestorzy Branżowi: Sieci Retail, E-grocery i Q-commerce
*(Ramiona inwestycyjne sieci handlowych i operatorów dostaw zakupów spożywczych)*
* **Dlaczego ten projekt:** Walczą o lojalność klienta i regularność zakupów. Urządzenie w kuchni powiązane ze stanem spiżarni staje się bezpośrednim kanałem domawiania brakujących składników do koszyka online.
* **Twarde dane rynkowe:**
  * Blisko 78% Polaków robi zakupy spożywcze od 1 do 3 razy w tygodniu, zostawiając jednorazowo 50–150 zł.
  * Automatyczne generowanie listy zakupów prosto z aplikacji do e-sklepu sieci partnerskiej gwarantuje powtarzalny obrót bez wysokich kosztów pozyskania zamówienia (CAC).

---

### 1.3. Liderzy Rynku Cateringu Dietetycznego (Diety Pudełkowe)
* **Dlaczego ten projekt:** Głównym problemem rynku diet pudełkowych jest wysoki odpływ klientów (churn). Średni czas trwania zamówienia to zaledwie 10–14 dni, po czym klienci rezygnują z powodu monotonii lub kosztów.
* **Twarde dane rynkowe:**
  * Rynek cateringu dietetycznego w Polsce przekroczył 3,5 mld zł i konsoliduje się wokół kilku czołowych graczy.
  * Model hybrydowy: urządzenie może być oferowane jako wsparcie w dniach, kiedy klient nie zamawia pudełek (np. w weekendy lub po zakończeniu dwutygodniowego cyklu), utrzymując go w ekosystemie marki cateringowej.

---

### 1.4. Fundusze VC: Consumer HealthTech / Prewencja i Długowieczność
* **Dlaczego ten projekt:** Inwestują w cyfrowe narzędzia zmiany nawyków żywieniowych i prewencji chorób cywilizacyjnych (cukrzyca typu 2, otyłość, stany zapalne jelit).
* **Twarde dane rynkowe:**
  * Spożycie błonnika w Polsce wynosi poniżej 18 g dziennie (przy normie min. 25 g wg WHO), a spożycie soli przekracza normę dwukrotnie (11,5 g/dobę).
  * Badania kliniczne (np. American Gut Project) dowodzą, że spożywanie minimum 30 różnych roślin tygodniowo znacząco poprawia profil mikrobiomu i produkcję krótkołańcuchowych kwasów tłuszczowych (SCFA). System promuje ten cel w sposób niewidoczny dla użytkownika.

---

## 2. Główne Przewagi Projektu z Perspektywy Inwestorskiej

1. **Niski koszt produkcji przy wysokim koszcie zmiany (Switching Cost):**
   * Wykorzystanie mikrokontrolera ESP32, prostego wyświetlacza OLED/e-Paper i enkodera pozwala zamknąć koszt podzespołów w kwocie kilkudziesięciu złotych.
   * Fizyczne urządzenie przyczepione do lodówki sprawia, że użytkownik nie zapomina o usłudze po kilku dniach, co drastycznie obniża churn typowy dla aplikacji mobilnych.
2. **Rozwiązanie luki rynkowej między drogimi robotami a aplikacjami:**
   * Istnieje ogromna przestrzeń pomiędzy aplikacjami z przepisami (które są niewygodne w kuchni), a zaawansowanymi robotami typu Thermomix (które kosztują ponad 5 000 zł i zajmują pół blatu). Nasz moduł daje wygodę sterowania bez telefonu za ułamek tej ceny.
3. **Dywersyfikacja strumieni przychodowych:**
   * Sprzedaż urządzenia fizycznego (marża na sprzęcie).
   * Opcjonalna subskrypcja premium w aplikacji (zaawansowane plany zdrowotne, rozszerzona baza przepisów).
   * Prowizje afiliacyjne B2B za przekierowanie koszyków zakupowych do partnerskich sieci e-grocery.
