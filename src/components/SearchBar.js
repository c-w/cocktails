import React from 'react';
import Input from 'semantic-ui-react/dist/es/elements/Input/Input';
import debounce from 'lodash/debounce';

const ON_CHANGE_DEBOUNCE_MS = 250;

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.defaultValue,
    };

    this._onChange = debounce(props.onChange, ON_CHANGE_DEBOUNCE_MS);
  }

  onChange = (event, props) => {
    const { value } = props;

    this.setState({ value }, () => this._onChange(value));
  }

  onIconClick = () => {
    const { value } = this.state;

    if (value) {
      this.setState({ value: '' }, () => this._onChange(''));
    } else {
      this._onChange(value);
    }
  }

  render() {
    const { placeholder, className } = this.props;
    const { value } = this.state;

    return (
      <div className={className}>
        <Input
          icon
          value={value}
          placeholder={placeholder}
          onChange={this.onChange}
        >
          <input />
          <i
            className={`link icon ${value ? 'close' : 'search'}`}
            onClick={this.onIconClick}
            aria-hidden
          />
        </Input>
      </div>
    );
  }
}
