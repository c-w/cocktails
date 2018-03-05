import React from 'react';
import Input from 'semantic-ui-react/dist/es/elements/Input/Input';

export default class SearchBar extends React.Component {
  onChange = (event, props) => {
    this.props.onChange(props.value);
  }

  render() {
    const { placeholder, defaultValue } = this.props;

    return (
      <div className="searchBar">
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
