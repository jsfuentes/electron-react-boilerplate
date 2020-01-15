// @flow
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';

import routes from './constants/routes.json';
import HomePage from './Pages/HomePage';

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </BrowserRouter>
);

export default hot(App);
