import React from 'react';
import Rating from 'semantic-ui-react/dist/es/modules/Rating/Rating';

const maxRating = 5;

export default class StarRating extends React.PureComponent {
  render() {
    const { rating } = this.props;

    return (
      <Rating
        icon='star'
        defaultRating={rating}
        maxRating={maxRating}
        disabled
      />
    );
  }
}
