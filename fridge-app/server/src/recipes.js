export const RECIPES = [
  { id: 'jajecznica', name: 'Jajecznica', emoji: '🍳', time: 10, difficulty: 'łatwe', ingredients: ['Jajka', 'Masło'], steps: ['Rozgrzej masło na patelni.', 'Dodaj jajka i smaż do ścięcia białka.', 'Podaj od razu.'] },
  { id: 'omlet', name: 'Omlet z serem', emoji: '🥚', time: 15, difficulty: 'łatwe', ingredients: ['Jajka', 'Ser żółty', 'Masło'], steps: ['Ubij jajka.', 'Smaż omlet na maśle.', 'Dodaj starty ser i złóż omlet.'] },
  { id: 'tosty-ser', name: 'Tosty z serem', emoji: '🥪', time: 10, difficulty: 'łatwe', ingredients: ['Chleb', 'Ser żółty', 'Masło'], steps: ['Posmaruj chleb masłem.', 'Dodaj ser i zapiecz.'] },
  { id: 'makaron-pomidorowy', name: 'Makaron pomidorowy', emoji: '🍝', time: 20, difficulty: 'łatwe', ingredients: ['Makaron', 'Pomidory w puszce', 'Olej'], steps: ['Ugotuj makaron.', 'Podsmaż przecier z puszki.', 'Połącz makaron z sosem.'] },
  { id: 'kurczak-warzywa', name: 'Kurczak z warzywami', emoji: '🍗', time: 30, difficulty: 'średnie', ingredients: ['Pierś z kurczaka', 'Papryka', 'Cebula', 'Olej'], steps: ['Pokrój mięso i warzywa.', 'Smaż kurczaka z cebulą i papryką.', 'Podawaj po osiągnięciu bezpieczeństwa mięsa.'] },
  { id: 'piers-warzywa', name: 'Pierś z ryżem i warzywami', emoji: '🍛', time: 35, difficulty: 'średnie', ingredients: ['Pierś z kurczaka', 'Ryż', 'Brokuł', 'Marchew'], steps: ['Ugotuj ryż.', 'Obgotuj warzywa i usmaż kurczaka.', 'Podaj razem.'] },
  { id: 'zupa-pomidorowa', name: 'Zupa pomidorowa', emoji: '🥣', time: 25, difficulty: 'łatwe', ingredients: ['Pomidory w puszce', 'Makaron', 'Cebula'], steps: ['Zetrzyj przecier i zagotuj z wodą.', 'Dodaj cebulę i makaron.', 'Gotuj do miękkości makaronu.'] },
  { id: 'salatka-ser', name: 'Sałatka z serem', emoji: '🥗', time: 15, difficulty: 'łatwe', ingredients: ['Sałata', 'Pomidory', 'Ogórki', 'Ser żółty'], steps: ['Pokrój wszystkie składniki.', 'Wymieszaj i dodaj ser.'] },
  { id: 'chleb-jajka', name: 'Kanapki jajeczne', emoji: '🥚', time: 12, difficulty: 'łatwe', ingredients: ['Chleb', 'Jajka', 'Sałata'], steps: ['Ugotuj jajka.', 'Pokrój na plasterki.', 'Złóż z sałatą i chlebem.'] },
  { id: 'ryz-szynka', name: 'Ryż ze szynką i jajkiem', emoji: '🍚', time: 20, difficulty: 'łatwe', ingredients: ['Ryż', 'Szynka', 'Jajka'], steps: ['Ugotuj ryż i jajko.', 'Pokrój szynkę i wymieszaj składniki.'] },
  { id: 'nalesniki', name: 'Naleśniki', emoji: '🥞', time: 25, difficulty: 'średnie', ingredients: ['Mąka', 'Mleko', 'Jajka'], steps: ['Wymieszaj mąkę, mleko i jajka.', 'Smaż cienkie naleśniki.'] },
  { id: 'kotleciki-ryz', name: 'Kotleciki z ryżu i sera', emoji: '🍘', time: 30, difficulty: 'średnie', ingredients: ['Ryż', 'Ser żółty', 'Jajka'], steps: ['Wymieszaj ugotowany ryż z serem i jajkiem.', 'Formuj kotleciki i złóż z obu stron.'] },
  { id: 'frittata', name: 'Frittata warzywna', emoji: '🍳', time: 25, difficulty: 'średnie', ingredients: ['Jajka', 'Papryka', 'Cebula', 'Ser żółty'], steps: ['Podsmaż warzywa.', 'Wlej jajka i posyp serem.', 'Zapiekaj do ścięcia jajek.'] },
  { id: 'pizza-chleb', name: 'Pizza na chlebie', emoji: '🍕', time: 18, difficulty: 'łatwe', ingredients: ['Chleb', 'Ketchup', 'Ser żółty'], steps: ['Rozsmaruj ketchup na chlebie.', 'Dodaj ser i piecz do stopienia.'] },
  { id: 'owsianka', name: 'Owsianka owocowa', emoji: '🥣', time: 8, difficulty: 'łatwe', ingredients: ['Płatki', 'Mleko', 'Banany', 'Jabłka'], steps: ['Zagotuj mleko z płatkami.', 'Dodaj pokrojone owoce.'] },
];

function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function getRecommendations(fridgeItems, limit = 2) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const available = fridgeItems.map((item) => ({ ...item, normalized: normalize(item.name) }));

  return RECIPES.map((recipe) => {
    let matched = [];
    let missing = [];

    for (const ingredient of recipe.ingredients) {
      const n = normalize(ingredient);
      const item = available.find((f) => f.normalized.includes(n) || n.includes(f.normalized));
      if (item) matched.push(item);
      else missing.push(ingredient);
    }

    const expiries = matched.map((item) => {
      const [y, m, d] = item.expires.split('-').map(Number);
      return Math.round((new Date(y, m - 1, d) - today) / 86_400_000);
    });
    const urgentDays = expiries.length ? Math.min(...expiries) : 365;
    const urgencyBonus = urgentDays <= 2 ? 100 : urgentDays <= 7 ? 50 : urgentDays <= 14 ? 20 : 0;
    const coverage = matched.length / recipe.ingredients.length;
    const score = coverage * 100 + urgencyBonus - missing.length * 8;

    return {
      ...recipe,
      matched: matched.map((item) => item.name),
      missing,
      urgentDays,
      coverage: Math.round(coverage * 100),
      score: Math.round(score),
    };
  })
    .sort((a, b) => b.score - a.score || b.coverage - a.coverage || a.urgentDays - b.urgentDays)
    .slice(0, limit);
}
