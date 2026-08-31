const STORAGE_KEY = 'yum-quest-data-v1';

const recipes = [
  {
    id: 'veggie-sandwich',
    name: 'Grilled Veggie Sandwich',
    cuisine: 'Indian',
    type: 'Vegetarian',
    emoji: '🥪',
    color: '#f29b63',
    time: '15 min',
    servings: 2,
    ingredients: [
      '2 bread slices',
      '1/2 bell pepper',
      '1/4 onion',
      '1/2 tomato',
      '1/2 zucchini',
      '2 cheese slices',
      '1 teaspoon butter'
    ],
    steps: [
      'Wash and slice all the vegetables with help from an adult if needed.',
      'Spread butter on the bread and add the vegetables and cheese.',
      'Toast the sandwich in a pan until golden and the cheese melts.',
      'Cut it in half and enjoy it while warm.'
    ]
  },
  {
    id: 'tomato-pasta',
    name: 'Creamy Tomato Pasta',
    cuisine: 'Italian',
    type: 'Quick',
    emoji: '🍝',
    color: '#ec6f63',
    time: '20 min',
    servings: 4,
    ingredients: [
      '2 cups pasta',
      '3 tomatoes',
      '2 garlic cloves',
      '1/2 cup cream',
      '1/4 cup parmesan',
      '1 teaspoon herbs'
    ],
    steps: [
      'Boil the pasta until soft, then carefully drain the water.',
      'Cook garlic and tomatoes in a pan until the tomatoes become saucy.',
      'Mix in cream, herbs, and cheese.',
      'Add the pasta, stir well, and serve.'
    ]
  },
  {
    id: 'bean-tacos',
    name: 'Black Bean Tacos',
    cuisine: 'Mexican',
    type: 'Vegetarian',
    emoji: '🌮',
    color: '#f4bd58',
    time: '18 min',
    servings: 3,
    ingredients: [
      '6 small tortillas',
      '1 cup black beans',
      '1/2 cup corn',
      '1 avocado',
      '1 lime',
      '1/2 tomato',
      '1 teaspoon taco seasoning'
    ],
    steps: [
      'Warm the tortillas in a dry pan.',
      'Heat beans, corn, and seasoning together.',
      'Fill each tortilla with the bean mix, tomato, and avocado.',
      'Add lime juice and enjoy.'
    ]
  },
  {
    id: 'noodle-bowl',
    name: 'Sesame Noodle Bowl',
    cuisine: 'Asian',
    type: 'Quick',
    emoji: '🍜',
    color: '#b87edf',
    time: '15 min',
    servings: 2,
    ingredients: [
      '2 noodle portions',
      '1 teaspoon sesame oil',
      '1 carrot',
      '1/2 cucumber',
      '1 tablespoon soy sauce',
      '1 teaspoon sesame seeds'
    ],
    steps: [
      'Cook noodles and cool them for a moment.',
      'Slice carrot and cucumber into thin strips.',
      'Mix sesame oil and soy sauce in a bowl.',
      'Toss everything together and sprinkle sesame seeds on top.'
    ]
  },
  {
    id: 'fruit-yogurt',
    name: 'Rainbow Yogurt Cup',
    cuisine: 'Quick',
    type: 'Vegetarian',
    emoji: '🍓',
    color: '#ed83a8',
    time: '5 min',
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
      'Spoon yogurt into two cups.',
      'Slice the fruit and place it on top in colorful rows.',
      'Drizzle a little honey.',
      'Add granola just before eating.'
    ]
  },
  {
    id: 'mini-pizza',
    name: 'Mini Veggie Pizza',
    cuisine: 'Italian',
    type: 'Quick',
    emoji: '🍕',
    color: '#ee8d48',
    time: '20 min',
    servings: 2,
    ingredients: [
      '2 pita breads',
      '4 tablespoons pizza sauce',
      '1/2 cup mozzarella',
      '1/2 bell pepper',
      '1/4 onion',
      '1/2 teaspoon herbs'
    ],
    steps: [
      'Spread pizza sauce over each pita bread.',
      'Add cheese and chopped vegetables.',
      'Bake or cook in a covered pan until the cheese melts.',
      'Sprinkle herbs and slice into small pieces.'
    ]
  }
];

const $ = (id) => document.getElementById(id);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      return {
        favourites: Array.isArray(saved.favourites) ? saved.favourites : [],
        shopping: Array.isArray(saved.shopping) ? saved.shopping : [],
        plan: Array.isArray(saved.plan) ? saved.plan : [],
        nextDay: Number(saved.nextDay) || 0
      };
    }
  } catch (error) {
    console.warn('Could not load saved recipe data.', error);
  }

  return {
    favourites: [],
    shopping: [],
    plan: [],
    nextDay: 0
  };
}

let state = load();
let favouritesOnly = false;
let activeRecipe = null;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function findRecipe(id) {
  return recipes.find((recipe) => recipe.id === id);
}

function renderRecipes() {
  const searchText = $('search').value.trim().toLowerCase();
  const filter = $('filter').value;

  const filtered = recipes.filter((recipe) => {
    const words = `${recipe.name} ${recipe.cuisine} ${recipe.type} ${recipe.ingredients.join(' ')}`.toLowerCase();

    const matchesSearch = !searchText || words.includes(searchText);
    const matchesFilter =
      !filter ||
      recipe.cuisine === filter ||
      recipe.type === filter;

    const matchesFavourite =
      !favouritesOnly || state.favourites.includes(recipe.id);

    return matchesSearch && matchesFilter && matchesFavourite;
  });

  $('recipeCount').textContent =
    `${filtered.length} recipe${filtered.length === 1 ? '' : 's'} found`;

  $('showFavorites').textContent =
    favouritesOnly ? '← Show all recipes' : '♡ My favourites';

  $('recipes').innerHTML = filtered.length
    ? filtered
        .map((recipe) => {
          const saved = state.favourites.includes(recipe.id);

          return `
            <article class="recipe-card" style="--card-color:${recipe.color}">
              <div class="recipe-emoji">${recipe.emoji}</div>
              <h3>${recipe.name}</h3>
              <p>${recipe.time} · Serves ${recipe.servings}</p>

              <div class="tags">
                <span class="tag">${recipe.cuisine}</span>
                <span class="tag">${recipe.type}</span>
              </div>

              <div class="card-actions">
                <button data-open="${recipe.id}">View recipe</button>
                <button class="favourite" data-favourite="${recipe.id}">
                  ${saved ? '♥ Saved' : '♡ Save'}
                </button>
              </div>
            </article>
          `;
        })
        .join('')
    : '<p class="empty">No recipe found. Try another food or ingredient.</p>';
}

function scaledIngredient(ingredient, multiplier) {
  if (multiplier === 1) return ingredient;
  return `${multiplier.toFixed(2).replace(/\.00$/, '')}× ${ingredient}`;
}

function renderDetail() {
  if (!activeRecipe) {
    $('detail').classList.add('hidden');
    return;
  }

  const recipe = activeRecipe;
  const saved = state.favourites.includes(recipe.id);

  $('detail').classList.remove('hidden');

  $('detail').innerHTML = `
    <div class="detail-top">
      <div>
        <p class="eyebrow">TODAY'S RECIPE</p>
        <h2>${recipe.emoji} ${recipe.name}</h2>
        <p>${recipe.time} · Base recipe serves ${recipe.servings}</p>
      </div>
      <button id="closeDetail" class="close-detail">Close</button>
    </div>

    <div class="detail-grid">
      <div>
        <div class="serving-box">
          <h3>Serving-size calculator</h3>
          <p>Cooking for more people? Change the number below.</p>

          <div class="serving-control">
            <label>
              Servings
              <input id="servingCount" type="number" min="1" value="${recipe.servings}">
            </label>
            <b id="multiplier">1× recipe</b>
          </div>
        </div>

        <div class="ingredients-box">
          <h3>Ingredients</h3>
          <ul id="ingredientList"></ul>
          <button id="addAllShopping">＋ Add all to shopping list</button>
        </div>
      </div>

      <div class="steps-box">
        <h3>Easy cooking steps</h3>
        <ol>
          ${recipe.steps.map((step) => `<li>${step}</li>`).join('')}
        </ol>

        <button id="addToPlan">📅 Add to weekly plan</button>
        <button id="detailFavourite" class="soft-button">
          ${saved ? '♥ Saved to favourites' : '♡ Save favourite'}
        </button>
      </div>
    </div>
  `;

  function renderIngredients() {
    const servings = Math.max(1, Number($('servingCount').value) || recipe.servings);
    const multiplier = servings / recipe.servings;

    $('multiplier').textContent =
      `${multiplier.toFixed(2).replace(/\.00$/, '')}× recipe`;

    $('ingredientList').innerHTML = recipe.ingredients
      .map(
        (ingredient, index) => `
          <li class="ingredient-row">
            <span>${scaledIngredient(ingredient, multiplier)}</span>
            <button class="add-item" data-ingredient="${index}">Add</button>
          </li>
        `
      )
      .join('');
  }

  renderIngredients();

  $('servingCount').addEventListener('input', renderIngredients);

  $('ingredientList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-ingredient]');
    if (!button) return;

    const index = Number(button.dataset.ingredient);
    addShoppingItem(recipe.ingredients[index]);
  });

  $('addAllShopping').addEventListener('click', () => {
    recipe.ingredients.forEach(addShoppingItem);
  });

  $('addToPlan').addEventListener('click', () => {
    addToPlan(recipe);
  });

  $('detailFavourite').addEventListener('click', () => {
    toggleFavourite(recipe.id);
  });

  $('closeDetail').addEventListener('click', () => {
    activeRecipe = null;
    renderDetail();
  });
}

function toggleFavourite(id) {
  if (state.favourites.includes(id)) {
    state.favourites = state.favourites.filter((recipeId) => recipeId !== id);
  } else {
    state.favourites.push(id);
  }

  save();
  renderRecipes();
  renderDetail();
}

function addShoppingItem(item) {
  if (!state.shopping.includes(item)) {
    state.shopping.push(item);
    save();
  }

  renderShopping();
}

function renderShopping() {
  $('shoppingList').innerHTML = state.shopping.length
    ? state.shopping
        .map(
          (item, index) => `
            <div class="shopping-row">
              <span>🛒 ${escapeHtml(item)}</span>
              <button class="remove" data-remove-shopping="${index}">×</button>
            </div>
          `
        )
        .join('')
    : '<p class="empty">Your shopping list is empty.</p>';
}

function addToPlan(recipe) {
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const day = days[state.nextDay % days.length];

  state.plan.push({
    id: crypto.randomUUID(),
    day,
    recipeId: recipe.id
  });

  state.nextDay += 1;
  save();
  renderPlan();
}

function renderPlan() {
  $('mealPlan').innerHTML = state.plan.length
    ? state.plan
        .map((item) => {
          const recipe = findRecipe(item.recipeId);

          if (!recipe) return '';

          return `
            <div class="plan-row">
              <span>
                <b>${item.day}</b>
                <small>${recipe.emoji} ${recipe.name}</small>
              </span>
              <button class="remove" data-remove-plan="${item.id}">×</button>
            </div>
          `;
        })
        .join('')
    : '<p class="empty">Open a recipe and add it to your weekly plan.</p>';
}

$('search').addEventListener('input', renderRecipes);
$('filter').addEventListener('change', renderRecipes);

$('showFavorites').addEventListener('click', () => {
  favouritesOnly = !favouritesOnly;
  renderRecipes();
});

$('recipes').addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-open]');
  const favouriteButton = event.target.closest('[data-favourite]');

  if (openButton) {
    activeRecipe = findRecipe(openButton.dataset.open);
    renderDetail();
    $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (favouriteButton) {
    toggleFavourite(favouriteButton.dataset.favourite);
  }
});

$('shoppingList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-shopping]');
  if (!button) return;

  state.shopping.splice(Number(button.dataset.removeShopping), 1);
  save();
  renderShopping();
});

$('mealPlan').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-plan]');
  if (!button) return;

  state.plan = state.plan.filter((item) => item.id !== button.dataset.removePlan);
  save();
  renderPlan();
});

$('clearShopping').addEventListener('click', () => {
  if (!state.shopping.length) return;

  if (confirm('Clear your shopping list?')) {
    state.shopping = [];
    save();
    renderShopping();
  }
});

renderRecipes();
renderShopping();
renderPlan();
