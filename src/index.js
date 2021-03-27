import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <App
    recipesUrl={process.env.REACT_APP_RECIPES_URL}
    aiRecipesUrl={process.env.REACT_APP_AI_RECIPES_URL}
    wordsUrl={process.env.REACT_APP_WORDS_URL}
    pageSize={parseInt(process.env.REACT_APP_PAGE_SIZE, 10)}
  />,
  document.getElementById('root'));

serviceWorker.register();
