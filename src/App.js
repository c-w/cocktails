import React from 'react';
import Container from 'semantic-ui-react/dist/es/elements/Container/Container';
import Message from 'semantic-ui-react/dist/es/collections/Message/Message';
import RecipesView from './views/RecipesView';
import fetchJson from './utils/fetchJson';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      recipes: []
    };
  }

  componentDidMount() {
    const { recipesUrl } = this.props;

    fetchJson(recipesUrl)
      .then(recipes => this.setState({ recipes }))
      .catch(error => this.setState({ error }));
  }

  wrapContent = (component) => (
    <Container>
      {component}
    </Container>
  );

  render() {
    const { error, recipes } = this.state;
    const { pageSize, numFilters } = this.props;

    if (recipes.length === 0) {
      return null;
    }

    if (error) {
      return this.wrapContent(
        <Message
          error
          content="Something went wrong while loading the recipes" />
      );
    }

    return this.wrapContent(
      <RecipesView
        recipes={recipes}
        recipesPerPage={pageSize}
        numFilters={numFilters}
      />
    );
  }
}
