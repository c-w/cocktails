import React from 'react';
import Checkbox from 'semantic-ui-react/dist/es/modules/Checkbox/Checkbox';
import List from 'semantic-ui-react/dist/es/elements/List/List';

export default class CheckBoxList extends React.PureComponent {
  onToggle = (event, props) => {
    this.props.onToggle(props.label);
  }

  termToListItem = ([term, isActive]) => ({
    key: term,
    content: <Checkbox label={term} checked={isActive} onChange={this.onToggle} />,
  })

  render() {
    const { terms } = this.props;

    return (
      <List
        horizontal
        items={Object.entries(terms).map(this.termToListItem)}
        size="large"
      />
    );
  }
}
