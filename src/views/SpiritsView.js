import React from 'react';
import AverageRatingsDisplay from '../components/AverageRatingsDisplay';
import i8n from '../i8n';

export default class SpiritsView extends React.PureComponent {
  render() {
    const { words, recipes, ratingsPerPage } = this.props;

    return (
      <AverageRatingsDisplay
        aggregations={words.bases}
        searchPlaceholder={i8n.spiritsSearchPlaceholder}
        recipes={recipes}
        ratingsPerPage={ratingsPerPage}
      />
    );
  }
}
