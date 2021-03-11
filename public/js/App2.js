import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from "react-router-dom";
import { ClientGameManager, Embed } from "./ClientGameManager.js";
import { Alert } from 'react-bootstrap';
import View2D from './View2D.js'
import Authenticator from './Authenticator.js'

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loggedIn: false,
			alert: '',
            game: null
		};

        this.authenticator = new Authenticator();

		this.handleCloseAlert = this.handleCloseAlert.bind(this);
		this.alert = this.alert.bind(this);
	}

	componentDidMount() {
        let game = View2D.create('Game', new ClientGameManager(), {}); // TODO: only initialize clientgamemanager when requested;
        this.setState({
            game: game
        });
        console.log('Authenticator:', this.authenticator)
        console.log('Game', game)
	}

	handleCloseAlert() {
		this.setState({alert: ''});
	}

	alert(props) {
		let alert = <Alert className="alert-banner" 
			variant={props.variant} 
			onClose={this.handleCloseAlert} 
			dismissible> {props.content} </Alert>;
		this.setState({
			alert: alert
		});
	}

	render() {
        return (
            <div className=''>
                {this.state.alert}
                {this.state.game ? View2D.unwrap(this.state.game) : ''}
            </div>
        );
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;