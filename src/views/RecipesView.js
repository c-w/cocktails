import React from 'react';
import { Link } from 'react-router-dom';
import partition from 'lodash/partition';
import Checkbox from 'semantic-ui-react/dist/es/modules/Checkbox/Checkbox';
import MultilineText from '../components/MultiLineText';
import PaginatedCardGroup from '../components/PaginatedCardGroup';
import Pantry from '../components/Pantry';
import RadioList from '../components/RadioList';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';
import i8n from '../i8n';
import { loadPantry, storePantry } from '../utils/cache';

const hasFilterText = (recipe, filterText) => {
  if (!filterText) {
    return true;
  }

  const searchCorpus = `${recipe.Name}\n${recipe.Ingredients}`.toLowerCase();

  const searchTerms = filterText
    .split('&&')
    .map(searchTerm => searchTerm.trim())
    .map(searchTerm => searchTerm.toLowerCase());

  const [ excludeTerms, includeTerms ] = partition(searchTerms, searchTerm => searchTerm.startsWith('!'));

  return includeTerms.every(includeTerm => searchCorpus.indexOf(includeTerm) !== -1)
      && excludeTerms.every(excludeTerm => searchCorpus.indexOf(excludeTerm.substring(1)) === -1);
};

const matchesPantry = (recipe, words, pantry) => {
  const { ingredients } = parseIngredients([recipe], words);

  return ingredients.every(ingredient => pantry[ingredient]);
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
      <MultilineText text={recipe.Ingredients} />
    </Link>,
  meta: <StarRating rating={recipe.Rating} />
});

const parseIngredients = (recipes, words) => {
  const spirits = [...words.spirits].map(spirit => spirit.toLowerCase());
  const ingredients = new Set();
  const isIngredient = new RegExp('^[0-9]+(\.[0-9]+)?[a-z]+ ', 'g');

  for (const recipe of recipes) {
    const lines = [];
    
    for (const line of recipe.Ingredients.toLowerCase().split('\n')) {
      const match = line.match(isIngredient);

      if (match != null) {
        lines.push(line.substring(match[0].length));
      }
    }

    for (const line of lines) {
      const spirit = spirits.find(spirit => line.indexOf(spirit) !== -1);

      if (spirit != null) {
        ingredients.add(spirit);
      } else {
        ingredients.add(line.replace(/ ?\([^)]*\)/g, ''));
      }
    }
  }

  return { ingredients: Array.from(ingredients).sort(), spirits };
}

export default class RecipesView extends React.PureComponent {
  constructor(props) {
    super(props);

    const { ingredients, spirits } = parseIngredients(props.recipes, props.words);

    for (const spirit of spirits) {
      ingredients.push(spirit);
    }

    const pantry = Object.fromEntries(ingredients.map(ingredient => [ingredient, false]));
    const cachedPantry = loadPantry();

    if (cachedPantry?.items != null) {
      for (const item of cachedPantry.items) {
        if (item in pantry) {
          pantry[item] = true;
        }
      }
    }

    this.state = {
      sortOrder: 'date',
      filterText: props.query || '',
      pantry,
      pantryEnabled: false,
    };
  }

  onSearchTextChange = (filterText) => {
    this.setState({ filterText });
  }

  onSortOrderChange = (sortOrder) => {
    this.setState({ sortOrder });
  }

  shouldShowRecipe = (recipe) => {
    const { filterText, pantryEnabled, pantry } = this.state;
    const { words } = this.props;

    return hasFilterText(recipe, filterText)
      && (!pantryEnabled || matchesPantry(recipe, words, pantry));
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

  onPantryChange = (pantry) => {
    this.setState({ pantry }, () => storePantry(pantry));
  }

  onPantryToggle = (event, props) => {
    this.setState({ pantryEnabled: props.checked });
  }

  render() {
    const { noSort, noPantry, recipes, recipesPerPage } = this.props;
    const { filterText, sortOrder, pantry, pantryEnabled } = this.state;

    const displayableRecipes = this.sort(recipes.filter(this.shouldShowRecipe));

    return (
      <div>
        <div className="recipeControls">
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
          {!noPantry && <>
            <Checkbox
              className="pantryFilter"
              label="Check pantry"
              checked={pantryEnabled}
              onChange={this.onPantryToggle}
              disabled={Object.values(pantry).every(available => !available)}
            />
            <Pantry
              onChange={this.onPantryChange}
              items={pantry}
            />
          </>}
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
