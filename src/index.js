import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App
    recipesUrl={process.env.REACT_APP_RECIPES_URL}
    pageSize={parseInt(process.env.REACT_APP_PAGE_SIZE, 10)}
    numFilters={parseInt(process.env.REACT_APP_NUM_FILTERS, 10)}
  />,
  document.getElementById('root'));
