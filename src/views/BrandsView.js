import React from 'react';
import AverageRatingsDisplay from '../components/AverageRatingsDisplay';
import i8n from '../i8n';

export default class BrandsView extends React.PureComponent {
  render() {
    const { words, recipes, ratingsPerPage } = this.props;

    return (
      <AverageRatingsDisplay
        aggregations={words.brands}
        searchPlaceholder={i8n.brandsSearchPlaceholder}
        recipes={recipes}
        ratingsPerPage={ratingsPerPage}
      />
    );
  }
}
