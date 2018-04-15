import React from 'react';
import HashRouter from 'react-router-dom/HashRouter';
import Redirect from 'react-router-dom/Redirect';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Container from 'semantic-ui-react/dist/es/elements/Container/Container';
import Message from 'semantic-ui-react/dist/es/collections/Message/Message';
import BrandsView from './views/BrandsView';
import RecipesView from './views/RecipesView';
import fetchJson from './utils/fetchJson';
import i8n from './i8n';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

const routes = {
  index: '/',
  recipes: '/recipes',
  brands: '/brands',
};

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

  renderIndex = (props) =>
    <Redirect to={routes.recipes} />

  renderRecipes = (props) =>
    <RecipesView
      recipes={this.state.recipes}
      words={this.state.words}
      recipesPerPage={this.props.pageSize}
      numFilters={this.props.numFilters}
    />

  renderBrands = (props) =>
    <BrandsView
      recipes={this.state.recipes}
      words={this.state.words}
      ratingsPerPage={this.props.pageSize}
    />

  render() {
    const { error, recipes } = this.state;

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
      <HashRouter>
        <Container>
          <Switch>
            <Route exact path={routes.index} component={this.renderIndex} />
            <Route exact path={routes.recipes} render={this.renderRecipes} />
            <Route exact path={routes.brands} render={this.renderBrands} />
          </Switch>
        </Container>
      </HashRouter>
    );
  }
}
