const RECIPES_CACHE_KEY = 'recipesCache.recipes';

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

export function loadRecipesData() {
  const cached = localStorage.getItem(RECIPES_CACHE_KEY);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
}
