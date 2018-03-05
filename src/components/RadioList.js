import React from 'react';
import List from 'semantic-ui-react/dist/es/elements/List/List';
import Radio from 'semantic-ui-react/dist/es/addons/Radio/Radio';

export default class RadioList extends React.PureComponent {
  onChange = (event, props) => {
    this.props.onChange(props.value);
  }

  render() {
    const { items, checked, className } = this.props;

    return (
      <div className={className}>
        <List horizontal>
          {items.map(item =>
            <List.Item key={item.value}>
              <Radio
                label={item.label}
                value={item.value}
                checked={checked === item.value}
                onChange={this.onChange}
              />
            </List.Item>
          )}
        </List>
      </div>
    );
  };
}
