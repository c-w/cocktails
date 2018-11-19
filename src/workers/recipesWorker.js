export default () => {
  // FIXME: keep in sync with RecipesView.js until es6 imports are supported in web workers
  const combineTokens = (sentence, combinedWords) => {
    for (const token of combinedWords) {
      const regexp = new RegExp(token, 'gi');
      sentence = sentence.replace(regexp, token.replace(/ /g, '_'));
    }

    return sentence;
  };

  // FIXME: keep in sync with RecipesView.js until es6 imports are supported in web workers
  const splitTokens = (sentence) => sentence.replace(/_/g, ' ');

  const buildCounter = (iterable) => {
    const counter = {};

    iterable.forEach(item => {
      if (!counter[item]) {
        counter[item] = 1;
      } else {
        counter[item]++;
      }
    });

    return counter;
  }

  const Counter = (iterable) => {
    const _counter = buildCounter(iterable);

    return {
      mostCommon: (num) => {
        return Object.entries(_counter)
          .sort((a, b) => b[1] - a[1])
          .map(pair => pair[0])
          .slice(0, num);
      },
    };
  }

  const hasAny = (token, words) => {
    for (const word of words) {
      if (token.indexOf(word) !== -1) {
        return true;
      }
    }

    return false;
  }

  const getFilterTerms = ({ recipes, numFilters, words }) => {
    const combineWords = new Set();
    for (const word of words.combined) combineWords.add(word);
    for (const word of words.brands) combineWords.add(word);
    for (const word of words.spirits) combineWords.add(word);

    const recipeWords = [];
    recipes
      .map(recipe => recipe.Ingredients)
      .forEach(ingredients => {
        ingredients
          .split('\n')
          .filter(ingredient => !hasAny(ingredient, words.blacklist))
          .forEach(ingredient => {
            combineTokens(ingredient, combineWords)
              .split(' ')
              .map(word => word.replace(/\([^)]*\)/g, ''))
              .map(word => splitTokens(word))
              .map(word => word.replace(/[^a-zA-Z ]/g, ''))
              .filter(word => word.length > 0)
              .map(word => word.toLowerCase())
              .filter(word => !hasAny(word, words.quantity))
              .filter(word => !hasAny(word, words.ignored))
              .forEach(word => recipeWords.push(word));
        });
      });

    return Counter(recipeWords)
      .mostCommon(numFilters)
      .map(term => ({ term, enabled: false }));
  }

  self.addEventListener('message', event => { // eslint-disable-line no-restricted-globals
    if (!event) {
      return;
    }

    const filterTerms = getFilterTerms(event.data);

    postMessage(filterTerms);
  });
}
