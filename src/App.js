
import React from "react";
import { render } from 'react-dom';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import {Menu} from 'semantic-ui-react';
import axios from 'axios';
import { useState } from 'react';
import PatientInput from './components/PatientInput';
import SignalPlotter from './components/SignalPlotter';
import RealTimePlotter from './components/RealTimePlotter';
import PatientDetails from './components/PatientDetails';


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";



// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

const options = {
  chart: {
                zoomType: 'x'
            },
  title: {
    text: 'My stock chart'
  },
  series: [
    {
      data: []
    }
  ]
};


export default function App() {

  return (
    <Router>
      <div>
      <Menu fluid tabular>
        <Menu.Item link>
            <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item link>
            <Link to="/realTime">Real time plot</Link>
        </Menu.Item>
        <Menu.Item link>
            <Link to="/signals">Signals</Link>
        </Menu.Item>
      </Menu>





        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          <Route exact path="/">
            <PatientInput />
          </Route>
          <Route path="/realTime" component={RealTimePlotter}>

          </Route>
          <Route path="/signals">
            <Signals />
          </Route>
          <Route path="/plot" component={PatientDetails}>
          </Route>
        </Switch>
        </div>
    </Router>
  );
}

// You can think of these components as "pages"
// in your app.



function About() {

  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

function Signals() {
  return (
    <div>
    <HighchartsReact
      highcharts={Highcharts}

      options={options}
    />
  </div>
  );
}
