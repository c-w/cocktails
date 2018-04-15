import React from 'react';
import Container from 'semantic-ui-react/dist/es/elements/Container/Container';
import Message from 'semantic-ui-react/dist/es/collections/Message/Message';
import RecipesView from './views/RecipesView';
import fetchJson from './utils/fetchJson';
import i8n from './i8n';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      recipes: [],
      words: {},
    };
  }

  componentDidMount() {
    const { recipesUrl, wordsUrl } = this.props;

    Promise.all([fetchJson(recipesUrl), fetchJson(wordsUrl)])
      .then(([recipes, words]) => this.setState({
        recipes,
        words: {
          combined: new Set(words.combined || []),
          blacklist: new Set(words.blacklist || []),
          quantity: new Set(words.quantity || []),
          brands: new Set(words.brands || []),
        },
      }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { error, recipes, words } = this.state;
    const { pageSize, numFilters } = this.props;

    if (recipes.length === 0) {
      return null;
    }

    if (error) {
      return (
        <Container>
          <Message error content={i8n.recipesLoadError} />
        </Container>
      );
    }

    return (
      <Container>
        <RecipesView
          recipes={recipes}
          recipesPerPage={pageSize}
          words={words}
          numFilters={numFilters}
        />
      </Container>
    );
  }
}
