import React from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Checkbox from 'semantic-ui-react/dist/es/modules/Checkbox/Checkbox';
import Icon from 'semantic-ui-react/dist/es/elements/Icon/Icon';
import Modal from 'semantic-ui-react/dist/es/modules/Modal/Modal';

export default class Pantry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: props.items,
      open: false,
    };
  }

  onPantrySave = () => {
    const { onChange } = this.props;
    const { items } = this.state;

    this.setState({ open: false }, () => onChange(items));
  }

  onPantryClear = (event) => {
    this.setState(prevState => ({
      items: Object.fromEntries(Object.keys(prevState.items).map(item => [item, false])),
    }));
  }

  onToggle = (event, props) => {
    this.setState(prevState => ({
      items: {
        ...prevState.items,
        [props.label]: props.checked,
      },
    }));
  }

  onModalOpen = () => {
    const { items } = this.props;

    this.setState({ open: true, items });
  }

  onModalClose = () => {
    this.setState({ open: false });
  }

  render() {
    const { items, open } = this.state;

    return (
      <Modal
        className="pantry"
        open={open}
        trigger={
          <i
            className="pantryToggle icon cart"
            role="button"
            aria-label="Open pantry"
            onClick={this.onModalOpen}
          />
        }
      >
        <Modal.Header>
          Pantry
        </Modal.Header>
        <Modal.Content scrolling>
          <ol className="pantryItems">
            {Object.entries(items).map(([label, checked]) =>
              <li className="item" key={label}>
                <Checkbox
                  label={label}
                  checked={checked}
                  onChange={this.onToggle}
                />
              </li>
            )}
          </ol>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.onPantryClear}>
            <Icon name="trash" />
            Clear
          </Button>
          <Button onClick={this.onModalClose}>
            <Icon name="cancel" />
            Cancel
          </Button>
          <Button positive onClick={this.onPantrySave}>
            <Icon name="save" />
            Save
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
