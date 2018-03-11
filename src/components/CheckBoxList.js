import React from 'react';
import Checkbox from 'semantic-ui-react/dist/es/modules/Checkbox/Checkbox';
import List from 'semantic-ui-react/dist/es/elements/List/List';

export default class CheckBoxList extends React.PureComponent {
  onToggle = (event, props) => {
    this.props.onToggle(props.label);
  }

  render() {
    const { items, className } = this.props;

    return (
      <div className={className}>
        <List horizontal>
          {items.map(item =>
            <List.Item key={item.label}>
              <Checkbox
                label={item.label}
                checked={item.checked}
                onChange={this.onToggle}
              />
            </List.Item>
          )}
        </List>
      </div>
    );
  }
}
