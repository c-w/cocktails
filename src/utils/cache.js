const RECIPES_CACHE_KEY = 'recipesCache.recipes';

const FILTERTERMS_CACHE_KEY = 'recipesCache.filterTerms';
const FILTERTERMS_IS_DIRTY = 'recipesCache.filterTerms.dirty';

const IS_DIRTY = '1';
const NOT_DIRTY = '0';

export function storeFilterTerms(filterTerms) {
  localStorage.setItem(FILTERTERMS_CACHE_KEY, JSON.stringify(filterTerms));
  localStorage.setItem(FILTERTERMS_IS_DIRTY, NOT_DIRTY);
}

export function loadFilterTerms() {
  const cached = localStorage.getItem(FILTERTERMS_CACHE_KEY);
  if (!cached) {
    return null;
  }

  const isDirty = localStorage.getItem(FILTERTERMS_IS_DIRTY);
  if (isDirty === IS_DIRTY) {
    return null;
  }

  return JSON.parse(cached);
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

  localStorage.setItem(FILTERTERMS_IS_DIRTY, IS_DIRTY);
}

export function loadRecipesData() {
  const cached = localStorage.getItem(RECIPES_CACHE_KEY);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
}
