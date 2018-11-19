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
import BottlesView from './views/BottlesView';
import BrandsView from './views/BrandsView';
import RecipesView from './views/RecipesView';
import SpiritsView from './views/SpiritsView';
import { storeRecipesData, loadRecipesData } from './utils/cache';
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
      cacheDate: '',
    };
  }

  componentDidMount() {
    const { recipesUrl, wordsUrl } = this.props;

    Promise.all([fetchJson(recipesUrl), fetchJson(wordsUrl)])
      .then(([recipes, words]) => {
        this.onRecipesLoaded({ recipes, words });
        storeRecipesData({ recipes, words });
      })
      .catch(error => {
        const cached = loadRecipesData();
        if (!cached) {
          this.setState({ error });
          return;
        }

        const { recipes, words, cacheDate } = cached;
        this.onRecipesLoaded({ recipes, words }, cacheDate);
      });
  }

  onRecipesLoaded = ({ recipes, words }, cacheDate) => {
    this.setState({
      recipes,
      words: {
        combined: new Set(words.combined || []),
        blacklist: new Set(words.blacklist || []),
        quantity: new Set(words.quantity || []),
        brands: new Set(words.brands || []),
        ignored: new Set(words.ignored || []),
        spirits: new Set(words.spirits || []),
      },
      cacheDate,
    });
  }

  onStaleDataWarningDismiss = () => {
    this.setState({ cacheDate: '' });
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

  renderBottles = (props) =>
    <BottlesView
      recipes={this.state.recipes}
      words={this.state.words}
      query={props.match.params.query}
      ratingsPerPage={this.props.pageSize}
    />

  renderStaleDataWarning = (props) => {
    const { cacheDate } = props;
    if (!cacheDate) {
      return null;
    }

    return (
      <Message warning floating icon onDismiss={this.onStaleDataWarningDismiss} className="messageTop">
        <Icon name="plug" />
        <Message.Content>
          <Message.Header>{i8n.recipesLoadError}</Message.Header>
          {i8n.recipesCacheWarning} {cacheDate}
        </Message.Content>
      </Message>
    );
  }

  renderNav = (props) => {
    const location = props.location.pathname;

    return (
      <Menu icon="labeled" size="mini" fixed="bottom">
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
        <Menu.Item as={Link} to="/bottles" active={location.startsWith('/bottles')}>
          <Icon name="winner" />
          {i8n.menuEntryBottles}
        </Menu.Item>
      </Menu>
    );
  }

  render() {
    const { error, recipes, cacheDate } = this.state;

    if (error) {
      return (
        <Container>
          <Message error content={i8n.recipesLoadError} className="messageTop" />
        </Container>
      );
    }

    if (recipes.length === 0) {
      return null;
    }

    return (
      <HashRouter>
        <Container>
          {this.renderStaleDataWarning({ cacheDate })}
          <Route path="*" component={this.renderNav} />
          <Switch>
            <Route exact path="/" component={this.renderIndex} />
            <Route exact path="/recipes/:query?" render={this.renderRecipes} />
            <Route exact path="/spirits/:query?" render={this.renderSpirits} />
            <Route exact path="/brands/:query?" render={this.renderBrands} />
            <Route exact path="/bottles/:query?" render={this.renderBottles} />
          </Switch>
        </Container>
      </HashRouter>
    );
  }
}
