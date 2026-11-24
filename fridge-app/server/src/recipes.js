export const RECIPES = [
  {
    id: 'kurczak-ryz-brokul',
    name: 'Kurczak z ryżem i brokułem',
    emoji: '🍛',
    time: 35,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Pierś z kurczaka', amount: 300, unit: 'g' },
      { name: 'Ryż', amount: 150, unit: 'g' },
      { name: 'Brokuł', amount: 1, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj ryż zgodnie z instrukcją na opakowaniu.',
      'Podziel brokuł na różyczki i ugotuj lub ugotuj na parze do miękkości.',
      'Pokrój kurczaka, dopraw i usmaż na oleju, aż będzie całkowicie gotowy.',
      'Podawaj kurczaka z ryżem i brokułem.',
    ],
  },
  {
    id: 'spaghetti-bolognese',
    name: 'Spaghetti bolognese',
    emoji: '🍝',
    time: 35,
    difficulty: 'łatwe',
    servings: 2,
    diets: [],
    ingredients: [
      { name: 'Makaron', amount: 180, unit: 'g' },
      { name: 'Mięso mielone', amount: 250, unit: 'g' },
      { name: 'Pomidory w puszce', amount: 1, unit: 'puszka' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj makaron al dente zgodnie z instrukcją na opakowaniu.',
      'Posiekaj cebulę i podsmaż na oleju.',
      'Dodaj mięso mielone i smaż, rozdrabniając je, aż będzie całkowicie ugotowane.',
      'Dodaj pomidory z puszki i duś sos przez około 15 minut. Podawaj z makaronem.',
    ],
  },
  {
    id: 'losos-ziemniaki',
    name: 'Pieczony łosoś z ziemniakami',
    emoji: '🐟',
    time: 40,
    difficulty: 'średnie',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Łosoś', amount: 300, unit: 'g' },
      { name: 'Ziemniaki', amount: 500, unit: 'g' },
      { name: 'Cytryny', amount: 0.5, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Nagrzej piekarnik do 200°C.',
      'Pokrój ziemniaki, wymieszaj z połową oleju i piecz około 25 minut.',
      'Skrop łososia sokiem z cytryny, dopraw i ułóż obok ziemniaków.',
      'Piecz jeszcze 12–15 minut, aż ryba będzie gotowa.',
    ],
  },
  {
    id: 'schab-ziemniaki',
    name: 'Schab z ziemniakami i marchewką',
    emoji: '🥩',
    time: 40,
    difficulty: 'średnie',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Schab', amount: 300, unit: 'g' },
      { name: 'Ziemniaki', amount: 500, unit: 'g' },
      { name: 'Marchew', amount: 2, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj ziemniaki i marchew do miękkości.',
      'Pokrój schab na kotlety i delikatnie rozbij.',
      'Usmaż na oleju po kilka minut z każdej strony, aż mięso będzie w pełni gotowe.',
      'Podawaj z warzywami.',
    ],
  },
  {
    id: 'curry-ciecierzyca',
    name: 'Curry z ciecierzycą i ryżem',
    emoji: '🍛',
    time: 30,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['vegetarian', 'vegan', 'gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Ciecierzyca', matchName: 'Fasola / kukurydza', amount: 1, unit: 'puszka' },
      { name: 'Pomidory w puszce', amount: 1, unit: 'puszka' },
      { name: 'Ryż', amount: 150, unit: 'g' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj ryż zgodnie z instrukcją na opakowaniu.',
      'Posiekaj cebulę i podsmaż na oleju.',
      'Dodaj odsączoną ciecierzycę, pomidory i przyprawy curry.',
      'Duś około 15 minut i podawaj z ryżem.',
    ],
  },
  {
    id: 'warzywa-ryz',
    name: 'Ryż z warzywami z patelni',
    emoji: '🥦',
    time: 25,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['vegetarian', 'vegan', 'gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Ryż', amount: 160, unit: 'g' },
      { name: 'Mrożone warzywa', amount: 300, unit: 'g' },
      { name: 'Papryka', amount: 1, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj ryż zgodnie z instrukcją na opakowaniu.',
      'Pokrój paprykę i podsmaż ją z warzywami na oleju.',
      'Dodaj ryż i smaż razem przez kilka minut, mieszając.',
      'Dopraw do smaku i podawaj na gorąco.',
    ],
  },
  {
    id: 'risotto-pieczarki',
    name: 'Risotto z pieczarkami',
    emoji: '🍄',
    time: 35,
    difficulty: 'średnie',
    servings: 2,
    diets: ['vegetarian', 'gluten_free'],
    ingredients: [
      { name: 'Ryż', amount: 180, unit: 'g' },
      { name: 'Pieczarki', amount: 200, unit: 'g' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Masło', amount: 1, unit: 'łyżka' },
      { name: 'Ser żółty', amount: 40, unit: 'g' },
    ],
    steps: [
      'Posiekaj cebulę, pokrój pieczarki i podsmaż je na maśle.',
      'Wsyp ryż i mieszaj przez minutę.',
      'Dolewaj stopniowo gorącą wodę, często mieszając, aż ryż będzie miękki.',
      'Dodaj starty ser, wymieszaj i podawaj.',
    ],
  },
  {
    id: 'kurczak-pomidorowy',
    name: 'Kurczak duszony w pomidorach z ryżem',
    emoji: '🍅',
    time: 35,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Pierś z kurczaka', amount: 300, unit: 'g' },
      { name: 'Pomidory w puszce', amount: 1, unit: 'puszka' },
      { name: 'Ryż', amount: 150, unit: 'g' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj ryż.',
      'Pokrój kurczaka i podsmaż na oleju z posiekaną cebulą.',
      'Dodaj pomidory i duś 15–20 minut, aż kurczak będzie całkowicie ugotowany.',
      'Podawaj z ryżem.',
    ],
  },
  {
    id: 'papryka-faszerowana',
    name: 'Papryka faszerowana mięsem i ryżem',
    emoji: '🫑',
    time: 50,
    difficulty: 'średnie',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Papryka', amount: 2, unit: 'szt.' },
      { name: 'Mięso mielone', amount: 200, unit: 'g' },
      { name: 'Ryż', amount: 80, unit: 'g' },
      { name: 'Pomidory w puszce', amount: 0.5, unit: 'puszki' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
    ],
    steps: [
      'Ugotuj ryż na półtwardo. Nagrzej piekarnik do 190°C.',
      'Podsmaż mięso z posiekaną cebulą, po czym wymieszaj z ryżem.',
      'Przekrój papryki i usuń gniazda nasienne. Napełnij farszem.',
      'Ułóż w naczyniu, dodaj pomidory i piecz około 30 minut.',
    ],
  },
  {
    id: 'zupa-fasolowa',
    name: 'Zupa fasolowa z warzywami',
    emoji: '🥣',
    time: 40,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['vegetarian', 'vegan', 'gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Fasola', matchName: 'Fasola / kukurydza', amount: 1, unit: 'puszka' },
      { name: 'Ziemniaki', amount: 2, unit: 'szt.' },
      { name: 'Marchew', amount: 1, unit: 'szt.' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Pomidory w puszce', amount: 0.5, unit: 'puszki' },
    ],
    steps: [
      'Pokrój ziemniaki i marchew, posiekaj cebulę.',
      'Włóż warzywa do garnka, zalej wodą i gotuj około 20 minut.',
      'Dodaj odsączoną fasolę i pomidory.',
      'Gotuj jeszcze 10 minut i dopraw do smaku.',
    ],
  },
  {
    id: 'zapiekanka-cukinia',
    name: 'Zapiekanka z cukinią i mozzarellą',
    emoji: '🥒',
    time: 40,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['vegetarian', 'gluten_free'],
    ingredients: [
      { name: 'Cukinia', amount: 1, unit: 'szt.' },
      { name: 'Mozzarella', amount: 125, unit: 'g' },
      { name: 'Pomidory', amount: 2, unit: 'szt.' },
      { name: 'Jajka', amount: 2, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Nagrzej piekarnik do 190°C i natłuść naczynie żaroodporne.',
      'Pokrój cukinię i pomidory, a mozzarellę porwij na kawałki.',
      'Ułóż warzywa w naczyniu, zalej roztrzepanymi jajkami i dodaj mozzarellę.',
      'Piecz około 25 minut, aż jajka się zetną.',
    ],
  },
  {
    id: 'pulpeciki-ziemniaki',
    name: 'Pulpeciki w sosie pomidorowym z ziemniakami',
    emoji: '🍲',
    time: 45,
    difficulty: 'średnie',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Mięso mielone', amount: 300, unit: 'g' },
      { name: 'Jajka', amount: 1, unit: 'szt.' },
      { name: 'Pomidory w puszce', amount: 1, unit: 'puszka' },
      { name: 'Ziemniaki', amount: 400, unit: 'g' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
    ],
    steps: [
      'Ugotuj ziemniaki.',
      'Wymieszaj mięso z jajkiem, dopraw i uformuj małe pulpeciki.',
      'Podsmaż posiekaną cebulę, dodaj pomidory i zagotuj sos.',
      'Włóż pulpeciki do sosu i duś pod przykryciem około 20 minut, aż będą gotowe.',
    ],
  },
  {
    id: 'patelnia-ziemniaki-kielbasa',
    name: 'Ziemniaki z kiełbasą i papryką',
    emoji: '🥔',
    time: 30,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Ziemniaki', amount: 500, unit: 'g' },
      { name: 'Kiełbasa', amount: 200, unit: 'g' },
      { name: 'Papryka', amount: 1, unit: 'szt.' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Pokrój ziemniaki w kostkę i ugotuj do miękkości.',
      'Pokrój kiełbasę, paprykę i cebulę.',
      'Podsmaż kiełbasę z warzywami na oleju.',
      'Dodaj ziemniaki i smaż razem kilka minut, delikatnie mieszając.',
    ],
  },
  {
    id: 'makaron-kurczak-pieczarki',
    name: 'Makaron z kurczakiem i pieczarkami',
    emoji: '🍝',
    time: 30,
    difficulty: 'łatwe',
    servings: 2,
    diets: [],
    ingredients: [
      { name: 'Makaron', amount: 180, unit: 'g' },
      { name: 'Pierś z kurczaka', amount: 250, unit: 'g' },
      { name: 'Pieczarki', amount: 150, unit: 'g' },
      { name: 'Śmietana', amount: 100, unit: 'ml' },
      { name: 'Olej', amount: 1, unit: 'łyżka' },
    ],
    steps: [
      'Ugotuj makaron zgodnie z instrukcją na opakowaniu.',
      'Pokrój kurczaka i pieczarki, następnie usmaż na oleju.',
      'Dodaj śmietanę i duś kilka minut, aż kurczak będzie gotowy, a sos zgęstnieje.',
      'Wymieszaj z makaronem i podawaj.',
    ],
  },
  {
    id: 'leczo-warzywne',
    name: 'Leczo warzywne z ryżem',
    emoji: '🥘',
    time: 35,
    difficulty: 'łatwe',
    servings: 2,
    diets: ['vegetarian', 'vegan', 'gluten_free', 'lactose_free'],
    ingredients: [
      { name: 'Papryka', amount: 2, unit: 'szt.' },
      { name: 'Cukinia', amount: 1, unit: 'szt.' },
      { name: 'Pomidory w puszce', amount: 1, unit: 'puszka' },
      { name: 'Cebula', amount: 1, unit: 'szt.' },
      { name: 'Ryż', amount: 150, unit: 'g' },
    ],
    steps: [
      'Ugotuj ryż.',
      'Pokrój paprykę, cukinię i cebulę.',
      'Podsmaż cebulę, dodaj pozostałe warzywa i pomidory.',
      'Duś pod przykryciem około 20 minut i podawaj z ryżem.',
    ],
  },
];

function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function getRecommendations(fridgeItems, limit = 2, diet = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const available = fridgeItems.map((item) => ({ ...item, normalized: normalize(item.name) }));
  const selectedDiets = Array.isArray(diet) ? diet : [];

  return RECIPES.filter((recipe) => selectedDiets.every((preference) => recipe.diets.includes(preference)))
    .map((recipe) => {
      const matched = [];
      const missing = [];

      for (const ingredient of recipe.ingredients) {
        const n = normalize(ingredient.matchName ?? ingredient.name);
        const item = available.find((f) => f.normalized.includes(n) || n.includes(f.normalized));
        if (item) matched.push(item);
        else missing.push(ingredient.name);
      }

      const expiries = matched
        .filter((item) => item.expires)
        .map((item) => {
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
