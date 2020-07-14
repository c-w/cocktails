import React from 'react';
import { Link } from 'react-router-dom';
import partition from 'lodash/partition';
import CheckBoxList from '../components/CheckBoxList';
import MultilineText from '../components/MultiLineText';
import PaginatedCardGroup from '../components/PaginatedCardGroup';
import RadioList from '../components/RadioList';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';
import WebWorker from '../workers/WebWorker';
import recipesWorker from '../workers/recipesWorker';
import { loadFilterTerms, storeFilterTerms } from '../utils/cache';
import i8n from '../i8n';

// FIXME: keep in sync with recipesWorker.js until es6 imports are supported in web workers
const combineTokens = (sentence, combinedWords) => {
  combinedWords.forEach(token => {
    const regexp = new RegExp(token, 'gi');
    sentence = sentence.replace(regexp, token.replace(/ /g, '_'));
  });

  return sentence;
};

// FIXME: keep in sync with recipesWorker.js until es6 imports are supported in web workers
const splitTokens = (sentence) => sentence.replace(/_/g, ' ');

const hasAllFilterTerms = (recipe, filterTerms) => {
  if (!filterTerms.length) {
    return true;
  }

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

  const searchTerms = filterText
    .split('&&')
    .map(searchTerm => searchTerm.trim())
    .map(searchTerm => searchTerm.toLowerCase());

  const [ excludeTerms, includeTerms ] = partition(searchTerms, searchTerm => searchTerm.startsWith('!'));

  return includeTerms.every(includeTerm => searchCorpus.indexOf(includeTerm) !== -1)
      && excludeTerms.every(excludeTerm => searchCorpus.indexOf(excludeTerm.substring(1)) === -1);
};

const sortOrders = [
  {label: i8n.recipesSortByDate, value: "date"},
  {label: i8n.recipesSortByRating, value: "rating", comparator: (recipeA, recipeB) => recipeB.Rating - recipeA.Rating},
];

const recipeToCard = (recipe, i) => ({
  key: `recipe-${i}-${recipe.Name}-${recipe.Ingredients}`,
  header: recipe.Name,
  description:
    <Link to={`/${window.location.href.split('#')[1].split('/')[1]}/${recipe.Name}`}>
      <MultilineText text={splitTokens(recipe.Ingredients)} />
    </Link>,
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
      filterTerms: [],
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

  componentDidMount() {
    const filterTerms = loadFilterTerms();
    if (filterTerms) {
      this.setState({ filterTerms });
      return;
    }

    const worker = new WebWorker(recipesWorker);
    worker.postMessage(this.props);

    worker.addEventListener('message', event => {
      const filterTerms = event.data;
      storeFilterTerms(filterTerms);
      this.setState({ filterTerms });
    });
  }

  render() {
    const { noSort, numFilters, recipes, recipesPerPage } = this.props;
    const { filterTerms, filterText, sortOrder } = this.state;

    const displayableRecipes = this.sort(recipes.filter(this.shouldShowRecipe));

    return (
      <div>
        <div className="recipeControls">
          {numFilters > 0 && <CheckBoxList
            className="filters"
            items={filterTerms.map(filterToCheckbox)}
            onToggle={this.onSearchTermToggle}
          />}
          <SearchBar
            className="searchBar"
            defaultValue={filterText}
            placeholder={i8n.recipesSearchPlaceholder}
            onChange={this.onSearchTextChange}
          />
          {!noSort && <RadioList
            className="sortOrder"
            items={sortOrders}
            checked={sortOrder}
            onChange={this.onSortOrderChange}
          />}
        </div>
        <PaginatedCardGroup
          className="paginatedCardGroup"
          itemsPerPage={recipesPerPage}
          items={displayableRecipes.map(recipeToCard)}
          key={displayableRecipes}
        />
      </div>
    );
  }
}
