import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Home from './componenets/Home/Home'
import Voting from './componenets/Voting/index'
import Result from './componenets/Results/Results'
import Registration from './componenets/Registration/Registration'
import AddCandidate from './componenets/Admin/AddCandidate/index'
import Verification from './componenets/Admin/Verification/index'
import Footer from './componenets/Footer/Footer'

import './App.css'

export default class App extends Component {
  render () {
    return (
      <div className='App'>
        <Router>
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/AddCandidate' component={AddCandidate} />
            <Route exact path='/Voting' component={Voting} />
            <Route exact path='/Results' component={Result} />
            <Route exact path='/Registration' component={Registration} />
            <Route exact path='/Verification' component={Verification} />
            <Route exact path='*' component={NotFound} />
          </Switch>
        </Router>
        <Footer />
      </div>
    )
  }
}
class NotFound extends Component {
  render () {
    return (
      <>
        <h1>404 NOT FOUND!</h1>
        <center>
          <p>
            The page your are looking for doesn't exist.
            <br />
            Go to{' '}
            <Link
              to='/'
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              Home
            </Link>
          </p>
        </center>
      </>
    )
  }
}
