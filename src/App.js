import React from 'react';
import HashRouter from 'react-router-dom/HashRouter';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Container from 'semantic-ui-react/dist/es/elements/Container/Container';
import Icon from 'semantic-ui-react/dist/es/elements/Icon/Icon';
import Menu from 'semantic-ui-react/dist/es/collections/Menu/Menu';
import Message from 'semantic-ui-react/dist/es/collections/Message/Message';
import BrandsView from './views/BrandsView';
import RecipesView from './views/RecipesView';
import SpiritsView from './views/SpiritsView';
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
          ignored: new Set(words.ignored || []),
          bases: new Set(words.bases || []),
        },
      }))
      .catch(error => this.setState({ error }));
  }

  renderIndex = (props) =>
    <Redirect to="/recipes" />

  renderRecipes = (props) =>
    <RecipesView
      recipes={this.state.recipes}
      words={this.state.words}
      query={props.match.params.query}
      recipesPerPage={this.props.pageSize}
      numFilters={this.props.numFilters}
    />

  renderSpirits = (props) =>
    <SpiritsView
      recipes={this.state.recipes}
      words={this.state.words}
      query={props.match.params.query}
      ratingsPerPage={this.props.pageSize}
    />

  renderBrands = (props) =>
    <BrandsView
      recipes={this.state.recipes}
      words={this.state.words}
      query={props.match.params.query}
      ratingsPerPage={this.props.pageSize}
    />

  renderNav = (props) => {
    const location = props.location.pathname;

    return (
      <Menu fixed="bottom">
        <Menu.Item as={Link} to="/recipes" active={location.startsWith('/recipes')}>
          <Icon name="cocktail" />
          {i8n.menuEntryRecipes}
        </Menu.Item>
        <Menu.Item as={Link} to="/spirits" active={location.startsWith('/spirits')}>
          <Icon name="bar chart" />
          {i8n.menuEntrySpirits}
        </Menu.Item>
        <Menu.Item as={Link} to="/brands" active={location.startsWith('/brands')}>
          <Icon name="line chart" />
          {i8n.menuEntryBrands}
        </Menu.Item>
      </Menu>
    );
  }

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
          <Route path="*" component={this.renderNav} />
          <Switch>
            <Route exact path="/" component={this.renderIndex} />
            <Route exact path="/recipes/:query?" render={this.renderRecipes} />
            <Route exact path="/spirits/:query?" render={this.renderSpirits} />
            <Route exact path="/brands/:query?" render={this.renderBrands} />
          </Switch>
        </Container>
      </HashRouter>
    );
  }
}
