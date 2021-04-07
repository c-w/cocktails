const RECIPES_CACHE_KEY = 'recipesCache.recipes';
const PANTRY_CACHE_KEY = 'recipesCache.pantry';

export function storePantry(newData) {
  localStorage.setItem(PANTRY_CACHE_KEY, JSON.stringify({
    items: Object.entries(newData).filter(([item, available]) => available).map(([item, available]) => item),
    cacheDate: new Date().toString(),
  }));
}

export function storeRecipesData(newData) {
  const oldData = loadRecipesData();

  if (oldData?.recipes?.length === newData.recipes.length &&
      oldData?.aiRecipes?.length === newData.aiRecipes.length &&
      oldData?.words?.length === newData.words.length) {
    return;
  }

  localStorage.setItem(RECIPES_CACHE_KEY, JSON.stringify({
    recipes: newData.recipes,
    aiRecipes: newData.aiRecipes,
    words: newData.words,
    cacheDate: new Date().toString(),
  }));
}

export function loadPantry() {
  const cached = localStorage.getItem(PANTRY_CACHE_KEY);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
}

export function loadRecipesData() {
  const cached = localStorage.getItem(RECIPES_CACHE_KEY);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
}
