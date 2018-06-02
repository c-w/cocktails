import React from 'react';
import CheckBoxList from '../components/CheckBoxList';
import Counter from '../utils/Counter';
import MultilineText from '../components/MultiLineText';
import PaginatedCardGroup from '../components/PaginatedCardGroup';
import RadioList from '../components/RadioList';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';
import i8n from '../i8n';

const combineTokens = (sentence, combinedWords) => {
  for (const token of combinedWords) {
    const regexp = new RegExp(token, 'gi');
    sentence = sentence.replace(regexp, token.replace(/ /g, '_'));
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

const getFilterTerms = ({ recipes, numFilters, words }) => {
  const combineWords = new Set([...words.combined, ...words.brands, ...words.spirits]);
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

const hasFilterText = (recipe, filterText, words) => {
  if (!filterText) {
    return true;
  }

  const searchCorpus = combineTokens(`${recipe.Name}\n${recipe.Ingredients}`.toLowerCase(), words.combined);

  return filterText
    .split('&&')
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

export default class RecipesView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      sortOrder: 'date',
      filterText: props.query || '',
      filterTerms: getFilterTerms(props)
    };
  }

  onSearchTermToggle = (filterTerm) => {
    const { filterTerms } = this.state;

    const newFilterTerms = filterTerms
      .map(({ term, enabled }) => term === filterTerm
        ? ({ term, enabled: !enabled })
        : ({ term, enabled }));

    this.setState({ filterTerms: newFilterTerms });
  }

  onSearchTextChange = (filterText) => {
    const { words } = this.props;

    const newFilterText = combineTokens(filterText, words.combined);
    this.setState({ filterText: newFilterText });
  }

  onSortOrderChange = (sortOrder) => {
    this.setState({ sortOrder });
  }

  shouldShowRecipe = (recipe) => {
    const { filterTerms, filterText } = this.state;
    const { words } = this.props;

    return hasAllFilterTerms(recipe, filterTerms) &&
      hasFilterText(recipe, filterText, words);
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
          className="paginatedCardGroup"
          itemsPerPage={recipesPerPage}
          items={displayableRecipes.map(recipeToCard)}
        />
      </div>
    );
  }
}
