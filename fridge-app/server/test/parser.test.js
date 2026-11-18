import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReceipt, matchProduct } from '../src/parser.js';
import { CATALOG } from '../src/catalog.js';

const RECEIPT = `BIEDRONKA
NIP 779-10-11-327
PARAGON FISKALNY
Mleko UHT 3,2% 1L   2 x 3,49   6,98 C
Chleb wiejski 1 x 4,99 4,99 C
Pomidory malinowe 0,456 x 14,99 6,83 C
Jajka M 10szt
1 x 8,99 8,99 C
Pierś z kurczaka 0,712 x 24,99 17,79 C
Makaron penne 500g 1 x 4,29 4,29 C
Pomidory krojone w puszce 400g 3,29 C
Serwetki 1 x 2,99 2,99 A
Reklamówka 1 x 0,20 0,20 A
SUMA PLN 43,16
KARTA 43,16`;

test('parseReceipt: pozycje, ilości, pomijanie nagłówków i reklamówek', () => {
  const items = parseReceipt(RECEIPT);
  assert.deepEqual(
    items.map((i) => [i.name, i.qty]),
    [
      ['Mleko UHT 3,2% 1L', 2],
      ['Chleb wiejski', 1],
      ['Pomidory malinowe', 1], // towar ważony -> 1
      ['Jajka M 10szt', 1], // nazwa i ilość w osobnych liniach
      ['Pierś z kurczaka', 1],
      ['Makaron penne 500g', 1],
      ['Pomidory krojone w puszce 400g', 1],
      ['Serwetki', 1],
    ],
  );
});

test('matchProduct: dopasowanie do katalogu, wygrywa najdłuższe słowo kluczowe', () => {
  const m = (n) => matchProduct(n, CATALOG)?.name;
  assert.equal(m('Mleko UHT 3,2% 1L'), 'Mleko');
  assert.equal(m('Pomidory malinowe'), 'Pomidory');
  assert.equal(m('Pomidory krojone w puszce 400g'), 'Pomidory w puszce');
  assert.equal(m('Pierś z kurczaka'), 'Pierś z kurczaka');
  assert.equal(m('Jajka M 10szt'), 'Jajka');
  assert.equal(m('Serwetki'), undefined);
  assert.equal(m('Sokołów szynka'), 'Szynka'); // "sok " to całe słowo – "Sokołów" nie jest sokiem
});

test('parseReceipt: pusty tekst', () => {
  assert.deepEqual(parseReceipt(''), []);
});
