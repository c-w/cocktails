import React from 'react';
import Statistic from 'semantic-ui-react/dist/es/views/Statistic/Statistic';
import PaginatedCardGroup from '../components/PaginatedCardGroup';
import SearchBar from '../components/SearchBar';
import MultiMap from '../utils/MultiMap';
import hashCode from '../utils/hashCode';
import mean from '../utils/mean';
import i8n from '../i8n';

const brandColors = ['orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown'];

const randomBrandColor = (brand) => brandColors[Math.abs(hashCode(brand)) % brandColors.length];

const meanRatingToCard = ({ brand, mean, support }) => {
  const color = randomBrandColor(brand);

  return {
    key: brand,
    header: brand,
    color,
    description:
      <Statistic.Group>
        <Statistic label={i8n.brandSupport} value={support} color={color} />
        <Statistic label={i8n.brandRating} value={mean.toFixed(2)} color={color} />
      </Statistic.Group>
  };
};

const toMeanRatings = (recipes, brands) => {
  const brandToRatings = new MultiMap();
  brands.forEach(brand =>
    recipes.filter(recipe => recipe.Ingredients.indexOf(brand) !== -1).forEach(recipe =>
      brandToRatings.add(brand, recipe.Rating)));

  return brandToRatings
    .map(([brand, ratings]) => ({ brand, mean: mean(ratings), support: ratings.length }))
    .sort((a, b) => Math.sign(b.mean - a.mean));
}

const applyRatingsFilter = (meanRatings, filterText) => {
  let ratingsFilter;
  if (filterText.startsWith('#<')) {
    const maxSupport = parseInt(filterText.substr(2), 10);
    ratingsFilter = ({ support }) => support < maxSupport;
  } else if (filterText.startsWith('#>')) {
    const minSupport = parseInt(filterText.substr(2), 10);
    ratingsFilter = ({ support }) => support > minSupport;
  } else {
    const searchTerm = filterText.toLowerCase();
    ratingsFilter = ({ brand }) => brand.toLowerCase().indexOf(searchTerm) !== -1;
  }

  return meanRatings.filter(ratingsFilter);
}

export default class BrandsView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      filterText: ''
    };
  }

  onSearchTextChange = (filterText) => {
    this.setState({ filterText });
  }

  render() {
    const { words, recipes, ratingsPerPage } = this.props;
    const { filterText } = this.state;

    const meanRatings = applyRatingsFilter(toMeanRatings(recipes, words.brands), filterText);

    return (
      <div>
        <div className="brandControls">
          <SearchBar
            className="searchBar"
            defaultValue={filterText}
            placeholder={i8n.brandsSearchPlaceholder}
            onChange={this.onSearchTextChange}
          />
        </div>
        <PaginatedCardGroup
          className="paginatedCardGroup"
          itemsPerPage={ratingsPerPage}
          items={meanRatings.map(meanRatingToCard)}
        />
      </div>
    );
  }
}
