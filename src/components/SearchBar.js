import React from 'react';
import Input from 'semantic-ui-react/dist/es/elements/Input/Input';

export default class SearchBar extends React.Component {
  onChange = (event, props) => {
    this.props.onChange(props.value);
  }

  render() {
    const { placeholder, defaultValue, className } = this.props;

    return (
      <div className={className}>
        <Input
          icon="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
