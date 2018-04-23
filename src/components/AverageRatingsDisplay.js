import React from 'react';
import Link from 'react-router-dom/Link';
import Statistic from 'semantic-ui-react/dist/es/views/Statistic/Statistic';
import PaginatedCardGroup from './PaginatedCardGroup';
import SearchBar from './SearchBar';
import MultiMap from '../utils/MultiMap';
import mean from '../utils/mean';
import hashCode from '../utils/hashCode';
import i8n from '../i8n';

const colors = ['orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown'];

const randomColor = (name) => colors[Math.abs(hashCode(name)) % colors.length];

const toMeanCard = ({ name, mean, support }) => {
  const color = randomColor(name);

  return {
    key: name,
    header: name,
    color,
    description:
      <Link to={`/recipes/${name}`}>
        <Statistic.Group>
          <Statistic label={i8n.meanRatingSupport} value={support} color={color} />
          <Statistic label={i8n.meanRatingValue} value={mean.toFixed(2)} color={color} />
        </Statistic.Group>
      </Link>
  };
}

const toMean = (recipes, aggregations) => {
  const aggregationToRatings = new MultiMap();
  aggregations.forEach(aggregation =>
    recipes.filter(recipe => recipe.Ingredients.indexOf(aggregation) !== -1).forEach(recipe =>
      aggregationToRatings.add(aggregation, recipe.Rating)));

  return aggregationToRatings
    .map(([name, ratings]) => ({ name, mean: mean(ratings), support: ratings.length }))
    .sort((a, b) => Math.sign(b.mean - a.mean));
}

const buildRatingsFilter = (filterText) => {
  if (filterText.startsWith('#<')) {
    const maxSupport = parseInt(filterText.substr(2), 10);
    return ({ support }) => support < maxSupport;
  }

  if (filterText.startsWith('#>')) {
    const minSupport = parseInt(filterText.substr(2), 10);
    return ({ support }) => support > minSupport;
  }

  if (filterText.length > 0) {
    const searchTerms = filterText.toLowerCase().split('||').map(searchTerm => searchTerm.trim());
    return ({ name }) => searchTerms.some(searchTerm => name.toLowerCase().indexOf(searchTerm) !== -1);
  }

  return () => true;
}

export default class AverageRatingsDisplay extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      filterText: props.query || ''
    };
  }

  onSearchTextChange = (filterText) => {
    this.setState({ filterText });
  }

  render() {
    const { aggregations, recipes, ratingsPerPage, searchPlaceholder } = this.props;
    const { filterText } = this.state;

    const ratingsFilter = buildRatingsFilter(filterText);
    const meanRatings = toMean(recipes, aggregations).filter(ratingsFilter);

    return (
      <div>
        <div className="brandControls">
          <SearchBar
            className="searchBar"
            defaultValue={filterText}
            placeholder={searchPlaceholder}
            onChange={this.onSearchTextChange}
          />
        </div>
        <PaginatedCardGroup
          className="paginatedCardGroup"
          itemsPerPage={ratingsPerPage}
          items={meanRatings.map(toMeanCard)}
        />
      </div>
    );
  }
}
