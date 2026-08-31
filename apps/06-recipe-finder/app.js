const STORAGE_KEY = 'quick-cook-shopping-list';

const recipes = [
  {
    id: 1,
    name: 'Grilled Veggie Sandwich',
    emoji: '🥪',
    color: '#f4a261',
    time: '15 minutes',
    servings: 2,
    ingredients: [
      '2 bread slices',
      '1/2 bell pepper',
      '1/4 onion',
      '1/2 tomato',
      '2 cheese slices',
      '1 teaspoon butter'
    ],
    steps: [
      'Cut the vegetables into small pieces.',
      'Put butter on the bread.',
      'Add vegetables and cheese between the bread slices.',
      'Toast in a pan until the bread is golden.',
      'Cut, serve, and enjoy.'
    ]
  },
  {
    id: 2,
    name: 'Creamy Tomato Pasta',
    emoji: '🍝',
    color: '#ef7967',
    time: '20 minutes',
    servings: 4,
    ingredients: [
      '2 cups pasta',
      '3 tomatoes',
      '2 garlic cloves',
      '1/2 cup cream',
      '1/4 cup cheese',
      '1 teaspoon herbs'
    ],
    steps: [
      'Boil pasta until soft, then drain the water.',
      'Cook garlic and tomatoes in a pan.',
      'Add cream, herbs, and cheese.',
      'Mix the pasta into the sauce.',
      'Serve warm.'
    ]
  },
  {
    id: 3,
    name: 'Black Bean Tacos',
    emoji: '🌮',
    color: '#f5c55d',
    time: '18 minutes',
    servings: 3,
    ingredients: [
      '6 small tortillas',
      '1 cup black beans',
      '1/2 cup corn',
      '1 avocado',
      '1 tomato',
      '1 lime'
    ],
    steps: [
      'Warm the tortillas in a pan.',
      'Heat the beans and corn together.',
      'Add beans into each tortilla.',
      'Add tomato and avocado.',
      'Squeeze lime on top and enjoy.'
    ]
  },
  {
    id: 4,
    name: 'Sesame Noodle Bowl',
    emoji: '🍜',
    color: '#b98be3',
    time: '15 minutes',
    servings: 2,
    ingredients: [
      '2 noodle portions',
      '1 carrot',
      '1/2 cucumber',
      '1 teaspoon sesame oil',
      '1 tablespoon soy sauce',
      '1 teaspoon sesame seeds'
    ],
    steps: [
      'Cook the noodles and let them cool a little.',
      'Cut carrot and cucumber into thin strips.',
      'Mix sesame oil and soy sauce.',
      'Mix noodles and vegetables together.',
      'Add sesame seeds on top.'
    ]
  },
  {
    id: 5,
    name: 'Fruit Yogurt Cup',
    emoji: '🍓',
    color: '#e98bad',
    time: '5 minutes',
    servings: 2,
    ingredients: [
      '1 cup yogurt',
      '1 banana',
      '1/2 cup strawberries',
      '1/2 cup grapes',
      '2 teaspoons honey',
      '2 tablespoons granola'
    ],
    steps: [
      'Put yogurt in a cup or bowl.',
      'Cut the fruit into small pieces.',
      'Place fruit on top of the yogurt.',
      'Add honey and granola.',
      'Eat right away.'
    ]
  },
  {
    id: 6,
    name: 'Mini Veggie Pizza',
    emoji: '🍕',
    color: '#ef9449',
    time: '20 minutes',
    servings: 2,
    ingredients: [
      '2 pita breads',
      '4 tablespoons pizza sauce',
      '1/2 cup mozzarella cheese',
      '1/2 bell pepper',
      '1/4 onion',
      '1 teaspoon herbs'
    ],
    steps: [
      'Put pizza sauce on each pita bread.',
      'Add cheese and vegetables.',
      'Bake or cook in a covered pan.',
      'Wait until cheese melts.',
      'Cut into pieces and serve.'
    ]
  }
];

const $ = (id) => document.getElementById(id);

let selectedRecipe = null;

function loadShopping() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let shopping = loadShopping();

function saveShopping() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shopping));
}

function cleanWords(text) {
  const ignoredWords = ['and', 'with', 'the', 'a', 'an'];

  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((word) => word.length > 1 && !ignoredWords.includes(word));
}

function renderRecipes() {
  const words = cleanWords($('search').value);

  const results = recipes.filter((recipe) => {
    const recipeText =
      `${recipe.name} ${recipe.ingredients.join(' ')}`.toLowerCase();

    return words.every((word) => recipeText.includes(word));
  });

  $('count').textContent =
    `${results.length} recipe${results.length === 1 ? '' : 's'} found`;

  $('recipeList').innerHTML = results.length
    ? results
        .map(
          (recipe) => `
            <article class="recipe">
              <div class="recipe-top" style="--recipe-color:${recipe.color}">
                ${recipe.emoji}
              </div>
              <div class="recipe-info">
                <h3>${recipe.name}</h3>
                <p>
                  Ready in ${recipe.time}<br>
                  Serves ${recipe.servings} people
                </p>
                <button data-recipe="${recipe.id}">Cook this recipe</button>
              </div>
            </article>
          `
        )
        .join('')
    : `
      <p class="empty">
        No recipe found. Try simple words like:
        <b>bread tomato</b> or <b>pasta</b>.
      </p>
    `;
}

function showRecipe(recipe) {
  selectedRecipe = recipe;

  $('recipeDetail').classList.remove('hidden');

  $('recipeDetail').innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">EASY RECIPE</p>
        <h2>${recipe.emoji} ${recipe.name}</h2>
        <p>Ready in ${recipe.time} · Base recipe serves ${recipe.servings}</p>
      </div>
      <button id="closeRecipe" class="clear">Close</button>
    </div>

    <div class="detail-grid">
      <div class="box">
        <h3>Ingredients</h3>

        <div class="servings">
          <label>
            Cooking for:
            <input id="servings" type="number" min="1" value="${recipe.servings}">
          </label>
          <b id="servingText">1× recipe</b>
        </div>

        <div id="ingredients" class="ingredients"></div>

        <button id="addAll">Add all to shopping list</button>
      </div>

      <div class="box">
        <h3>How to cook</h3>
        <ol class="steps">
          ${recipe.steps.map((step) => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    </div>
  `;

  function renderIngredients() {
    const wantedServings = Math.max(
      1,
      Number($('servings').value) || recipe.servings
    );

    const multiplier = wantedServings / recipe.servings;

    $('servingText').textContent =
      `${multiplier.toFixed(2).replace('.00', '')}× recipe`;

    $('ingredients').innerHTML = recipe.ingredients
      .map(
        (ingredient, index) => `
          <div class="ingredient">
            <span>${multiplier === 1 ? ingredient : `${multiplier.toFixed(2).replace('.00', '')}× ${ingredient}`}</span>
            <button class="add-one" data-ingredient="${index}">Add</button>
          </div>
        `
      )
      .join('');
  }

  renderIngredients();

  $('servings').addEventListener('input', renderIngredients);

  $('ingredients').addEventListener('click', (event) => {
    const button = event.target.closest('[data-ingredient]');
    if (!button) return;

    const ingredient = recipe.ingredients[Number(button.dataset.ingredient)];
    addToShopping(ingredient);
  });

  $('addAll').addEventListener('click', () => {
    recipe.ingredients.forEach(addToShopping);
  });

  $('closeRecipe').addEventListener('click', () => {
    selectedRecipe = null;
    $('recipeDetail').classList.add('hidden');
  });

  $('recipeDetail').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function addToShopping(item) {
  if (!shopping.includes(item)) {
    shopping.push(item);
    saveShopping();
  }

  renderShopping();
}

function renderShopping() {
  $('shoppingList').innerHTML = shopping.length
    ? shopping
        .map(
          (item, index) => `
            <div class="shop-item">
              <span>🛒 ${item}</span>
              <button class="remove" data-remove="${index}">×</button>
            </div>
          `
        )
        .join('')
    : '<p class="empty">Your shopping list is empty.</p>';
}

$('search').addEventListener('input', renderRecipes);

$('clearSearch').addEventListener('click', () => {
  $('search').value = '';
  renderRecipes();
});

$('recipeList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-recipe]');
  if (!button) return;

  const recipe = recipes.find(
    (item) => item.id === Number(button.dataset.recipe)
  );

  if (recipe) showRecipe(recipe);
});

$('shoppingList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;

  shopping.splice(Number(button.dataset.remove), 1);
  saveShopping();
  renderShopping();
});

$('clearShopping').addEventListener('click', () => {
  shopping = [];
  saveShopping();
  renderShopping();
});

renderRecipes();
renderShopping();
