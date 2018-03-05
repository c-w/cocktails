import React from 'react';
import CheckBoxList from '../components/CheckBoxList';
import Counter from '../utils/Counter';
import MultilineText from '../components/MultiLineText';
import PaginatedCardGroup from '../components/PaginatedCardGroup';
import RadioList from '../components/RadioList';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';
import i8n from '../i8n';

const quantityWords = new Set([
  'oz',
  'sp',
  'pinch',
  'cup',
  'drop',
  'slice',
  'grain',
  'cm',
  'gram',
  'piece',
  'dash',
]);

const blacklistWords = new Set([
  'old',
  'syrup',
  'simple',
  'sugar',
  'london',
  'brown',
  'year',
  'grand',
]);

const combinedWords = new Set([
  ' vermouth',
  ' juice',
  ' twist',
  ' bitters',
  'dry gin',
  'dry shake',
]);

const combineTokens = (sentence) => {
  for (const token of combinedWords) {
    const regexp = new RegExp(token, 'gi');
    sentence = sentence.replace(regexp, token.replace(' ', '_'));
  }

  return sentence;
};

const splitTokens = (sentence) => sentence.replace(/_/g, ' ');

const hasAny = (token, words) => {
  for (const word of words) {
    if (token.indexOf(word) !== -1) {
      return true;
    }
  }

  return false;
}

const isQuantity = (word) => hasAny(word, quantityWords);

const isBlacklisted = (word) => hasAny(word, blacklistWords);

const getFilterTerms = (recipes, numFilters) => {
  const recipeWords = [];
  recipes
    .map(recipe => recipe.Ingredients)
    .forEach(ingredients => {
      ingredients.split('\n').forEach(ingredient => {
        combineTokens(ingredient)
          .split(' ')
          .map(word => word.replace(/\([^)]*\)/g, ''))
          .map(word => splitTokens(word))
          .map(word => word.replace(/[^a-zA-Z ]/g, ''))
          .filter(word => word.length > 0)
          .map(word => word.toLowerCase())
          .filter(word => !isBlacklisted(word))
          .filter(word => !isQuantity(word))
          .forEach(word => recipeWords.push(word));
      });
    });

  return new Counter(recipeWords)
    .mostCommon(numFilters)
    .map(term => ({ term, enabled: false }));
}

const hasAllFilterTerms = (recipe, filterTerms) => {
  const searchCorpus = splitTokens(recipe.Ingredients).toLowerCase();

  return filterTerms
    .filter(filterTerm => filterTerm.enabled)
    .map(filterTerm => filterTerm.term.toLowerCase())
    .every(searchValue => searchCorpus.indexOf(searchValue) !== -1);
}

const hasFilterText = (recipe, filterText) => {
  if (!filterText) {
    return true;
  }

  const searchCorpus = `${recipe.Name} ${recipe.Ingredients}`.toLowerCase();

  return filterText
    .split('&&')
    .map(searchTerm => searchTerm.replace(/&/g, ''))
    .map(searchTerm => searchTerm.trim())
    .map(searchTerm => searchTerm.toLowerCase())
    .every(searchTerm => searchCorpus.indexOf(searchTerm) !== -1);
};

const sortOrders = [
  {label: i8n.recipesSortByDate, value: "date"},
  {label: i8n.recipesSortByRating, value: "rating", comparator: (recipeA, recipeB) => recipeB.Rating - recipeA.Rating},
];

const recipeToCard = (recipe, i) => ({
  key: `recipe-${i}-${recipe.Name}-${recipe.Ingredients}`,
  header: recipe.Name,
  description: <MultilineText text={splitTokens(recipe.Ingredients)} />,
  meta: <StarRating rating={recipe.Rating} />
});

const filterToCheckbox = (filter) => ({
  label: filter.term,
  checked: filter.enabled
});

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);

    let state = {};
    if (window.location.hash) {
      try {
        const serializedState = window.location.hash.replace('#/share/', '');
        state = JSON.parse(atob(decodeURIComponent(serializedState)));
      } catch (error) {
        window.location.hash = '';
      }
    }

    if (!state.filterTerms) {
      state.filterTerms = getFilterTerms(props.recipes, props.numFilters);
    }
    if (!state.filterText) {
      state.filterText = '';
    }
    if (!state.sortOrder) {
      state.sortOrder = 'date';
    }

    this.state = state;
  }

  onSearchTermToggle = (filterTerm) => {
    const { filterTerms } = this.state;

    const newFilterTerms = filterTerms
      .map(({ term, enabled }) => term === filterTerm
        ? ({ term, enabled: !enabled })
        : ({ term, enabled }));

    this.setState({ filterTerms: newFilterTerms }, this.serializeStateToUrl);
  }

  onSearchTextChange = (filterText) => {
    const newFilterText = combineTokens(filterText);
    this.setState({ filterText: newFilterText }, this.serializeStateToUrl);
  }

  onSortOrderChange = (sortOrder) => {
    this.setState({ sortOrder }, this.serializeStateToUrl);
  }

  serializeStateToUrl = () => {
    const serializedState = encodeURIComponent(btoa(JSON.stringify(this.state)));
    window.location.hash = `#/share/${serializedState}`;
  }

  shouldShowRecipe = (recipe) => {
    const { filterTerms, filterText } = this.state;

    return hasAllFilterTerms(recipe, filterTerms) &&
      hasFilterText(recipe, filterText);
  }

  sort = (recipes) => {
    const { sortOrder } = this.state;

    const comparator = sortOrders
      .filter(order => order.value === sortOrder)
      .map(order => order.comparator)[0];

    if (comparator) {
      recipes = recipes.sort(comparator);
    }

    return recipes;
  }

  render() {
    const { recipes, recipesPerPage } = this.props;
    const { filterTerms, filterText, sortOrder } = this.state;

    const displayableRecipes = this.sort(recipes.filter(this.shouldShowRecipe));

    return (
      <div>
        <div className="recipeControls">
          <CheckBoxList
            className="filters"
            items={filterTerms.map(filterToCheckbox)}
            onToggle={this.onSearchTermToggle}
          />
          <SearchBar
            className="searchBar"
            defaultValue={filterText}
            placeholder={i8n.recipesSearchPlaceholder}
            onChange={this.onSearchTextChange}
          />
          <RadioList
            className="sortOrder"
            items={sortOrders}
            checked={sortOrder}
            onChange={this.onSortOrderChange}
          />
        </div>
        <PaginatedCardGroup
          className="recipesList"
          itemsPerPage={recipesPerPage}
          items={displayableRecipes.map(recipeToCard)}
        />
      </div>
    );
  }
}
