const CACHE_KEY = 'recipesCache';

function clearRecipesCache(funcName) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(`${CACHE_KEY}.`) && key.endsWith(`.${funcName}`)) {
      localStorage.removeItem(key);
    }
  }
}

export function recipesCache(decorated, funcName) {
  return (args) => {
    const cacheKey = `${CACHE_KEY}.${args.recipes.length}.${funcName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached != null) {
      return JSON.parse(cached);
    }

    clearRecipesCache(funcName);

    const value = decorated(args);
    localStorage.setItem(cacheKey, JSON.stringify(value));
    return value;
  };
}

export function storeRecipesData({ recipes, words }) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    recipes,
    words,
    cacheDate: new Date().toString(),
  }));
}

export function loadRecipesData() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
}
