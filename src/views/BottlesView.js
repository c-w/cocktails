import React from 'react';
import Dropdown from 'semantic-ui-react/dist/es/modules/Dropdown/Dropdown';
import AverageRatingsDisplay from '../components/AverageRatingsDisplay';
import i8n from '../i8n';

function matcherFor(spirits) {
  return new RegExp(`\\s(${Array.from(spirits).join('|')})(\\s|$)`, 'i');
}

function getBottlesForSpirit(spirit, spirits, recipes) {
  const spiritMatcher = !spirit ? matcherFor(spirits) : matcherFor([spirit]);

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
          spirits={words.spirits}
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

    const allOption = { text: i8n.bottlesSpiritAllEntries, value: '' };
    const spiritOptions = Array.from(spirits).sort().map(spirit => ({ text: spirit, value: spirit }));
    const options = [allOption].concat(spiritOptions);

    return (
      <Dropdown
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
    const { spirit, spirits, recipes, ratingsPerPage } = this.props;

    return (
      <AverageRatingsDisplay
        aggregations={getBottlesForSpirit(spirit, spirits, recipes)}
        recipes={recipes}
        ratingsPerPage={ratingsPerPage}
      />
    );
  }
}
