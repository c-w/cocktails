export default function recipesCache(decorated, funcName) {
  return (args) => {
    const cacheKey = `recipesCache.${args.recipes.length}.${funcName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached != null) {
      return JSON.parse(cached);
    }

    const value = decorated(args);
    localStorage.setItem(cacheKey, JSON.stringify(value));
    return value;
  };
}
