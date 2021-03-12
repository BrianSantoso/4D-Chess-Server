import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from "react-router-dom";
import { ClientGameManager, Embed } from "./ClientGameManager.js";
import View2D from './View2D.js'
import Authenticator from './Authenticator.js'

import ChessNavbar from './components/Navbar.jsx';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loggedIn: false,
			alerter: View2D.create('Alerter', { showing: [] }),
            game: null // store game as state so that it will be rendered on creation. TODO: not pretty???
		};

        this.authenticator = new Authenticator();
	}

	componentDidMount() {
        let game = View2D.create('Game', new ClientGameManager(this.authenticator), {}); // TODO: only initialize clientgamemanager when requested;
        this.setState({
            game: game
        });
        console.log('Authenticator:', this.authenticator)
        console.log('Game', game)

        this.authenticator.init().then(token => {
            game.setAuthToken(token);
            this.state.alerter.alert({
                variant: 'success',
                content: 'test 1'
            });
            this.state.alerter.alert({
                variant: 'success',
                content: 'test 2'
            });
            this.state.alerter.alert({
                variant: 'success',
                content: 'test 3'
            });
        })
	}

	render() {
        return (
            <div className=''>
                <ChessNavbar loggedIn={false}/>
                {View2D.unwrap(this.state.alerter)}
                {this.state.game ? View2D.unwrap(this.state.game) : ''}
            </div>
        );
	}
}

App.main = function() {
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;