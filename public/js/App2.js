import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from "react-router-dom";
import { ClientGameManager, Embed } from "./ClientGameManager.js";
import { Alert } from 'react-bootstrap';
import * as Colyseus from "colyseus.js";
import axios from "axios";
import jwt from 'jsonwebtoken';
import View2D from './View2D.js'

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loggedIn: false,
			alert: ''
		};

		this.client = new Colyseus.Client("ws://localhost:3000");
        this.game = View2D.create('Game', new ClientGameManager(this.client), {}); // TODO: only initialize clientgamemanager when requested

		this.onAuthSuccess = this.onAuthSuccess.bind(this);
		this.handleCloseAlert = this.handleCloseAlert.bind(this);
		this.logout = this.logout.bind(this);
		this.alert = this.alert.bind(this);
		console.log(this.history)
		// history.goBack
	}

	componentDidMount() {
		// Must only be run once component is mounted
		// since we need to update state {loggedIn: }
		this.initAuthToken();
	}

	handleCloseAlert() {
		this.setState({alert: ''});
	}

	onAuthSuccess(response) {
		this.setAuthToken(response.data.token);
	}

	setAuthToken(jwtString) {
		let token = jwtString;
		try {
			let decoded = jwt.decode(token, {complete: true});
			this.game.setAuthToken(token);
			localStorage.setItem('authToken', token);
			console.log('authToken set: (decoded ver=)', decoded)
			const notAGuest = decoded.payload.registered;
			this.setState({
				loggedIn: notAGuest
			});
		} catch {
			console.error('Malformed authToken, logging out');
			this.logout();
		}	
	}

	initAuthToken() {
		let token = localStorage.getItem('authToken');
		if (token) {
			console.log('Retrieved Cached authToken:', token);
			this.setAuthToken(token);
			// TODO: tell server to update last login
		} else {
			axios.get('/register/guest').then(response => {
				token = response.data.token;
				console.log('Received guest authToken:', token);
				this.setAuthToken(token);
			}).catch(err => {
				console.log('Failed to retrieve guest authToken', err);
			});
		}
	}

	logout() {
		localStorage.removeItem('authToken');
		this.initAuthToken();
		// TODO: tell gamemanager to rejoin room.
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
		return View2D.unwrap(this.game);
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;