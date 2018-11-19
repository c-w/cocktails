const CACHE_KEY = 'recipesCache';

export function recipesCache(decorated, funcName) {
  return (args) => {
    const cacheKey = `${CACHE_KEY}.${args.recipes.length}.${funcName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached != null) {
      return JSON.parse(cached);
    }

    const value = decorated(args);
    localStorage.setItem(cacheKey, JSON.stringify(value));
    return value;
  };
}

export function storeRecipesData({ recipes, words }) {
  window.localStorage.setItem(CACHE_KEY, JSON.stringify({
    recipes,
    words,
    cacheDate: new Date().toString(),
  }));
}

export function loadRecipesData() {
  const cached = window.localStorage.getItem(CACHE_KEY);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
}
