import React from 'react';
import Dropdown from 'semantic-ui-react/dist/es/modules/Dropdown/Dropdown';
import AverageRatingsDisplay from '../components/AverageRatingsDisplay';
import i8n from '../i8n';

function getBottlesForSpirit(spirit, recipes) {
  const spiritMatcher = new RegExp(`\\s${spirit}(\\s|$)`, 'i');

  const bottles = new Set();

  recipes.forEach(recipe =>
    recipe.Ingredients
      .split('\n')
      .filter(ingredient => ingredient.match(spiritMatcher) != null)
      .map(ingredient => ingredient.replace(/\([^)]*\)/g, ''))
      .map(ingredient => ingredient.replace(/^[^ ]*/, ''))
      .map(ingredient => ingredient.trim())
      .forEach(bottle => bottles.add(bottle)));

  return Array.from(bottles).sort();
}

export default class BottlesView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedSpirit: props.query
    };
  }

  onSpiritChange = (selectedSpirit) => this.setState({ selectedSpirit });

  render() {
    const { words, recipes, ratingsPerPage } = this.props;
    const { selectedSpirit } = this.state;

    return (
      <div>
        <div className="bottleControls">
          <SpiritsSelector
            selectedSpirit={selectedSpirit}
            spirits={words.spirits}
            onChange={this.onSpiritChange}
          />
        </div>
        <TopBottlesDisplay
          spirit={selectedSpirit}
          recipes={recipes}
          ratingsPerPage={ratingsPerPage}
        />
      </div>
    );
  }
}

class SpiritsSelector extends React.PureComponent {
  onChange = (e, { value }) => this.props.onChange(value);

  render() {
    const { spirits, selectedSpirit } = this.props;

    const options = Array.from(spirits).sort().map(spirit => ({ text: spirit, value: spirit }));

    return (
      <Dropdown
        fluid
        search
        selection
        placeholder={i8n.bottlesSpiritSelectPlaceholder}
        options={options}
        onChange={this.onChange}
        defaultValue={selectedSpirit}
      />
    );
  }
}

class TopBottlesDisplay extends React.PureComponent {
  render() {
    const { spirit, recipes, ratingsPerPage } = this.props;

    if (!spirit) {
      return null;
    }

    return (
      <AverageRatingsDisplay
        aggregations={getBottlesForSpirit(spirit, recipes)}
        recipes={recipes}
        ratingsPerPage={ratingsPerPage}
      />
    );
  }
}
