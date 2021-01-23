import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from "react-router-dom";
import { ClientGameManager, Embed } from "./ClientGameManager.js";
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Popup from './components/Popup.jsx';
import Logout from './components/Logout.jsx';
import ChessNavbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import { Alert } from 'react-bootstrap';
import { CSSTransitionGroup } from 'react-transition-group';
import { createBrowserHistory } from "history";
import * as Colyseus from "colyseus.js";
import axios from "axios";
import jwt from 'jsonwebtoken';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focus: 'focused',
			loggedIn: false,
			alert: ''
		};

		this.client = new Colyseus.Client("ws://localhost:3000");
		this.gameManager = new ClientGameManager(this.client);

		this.embed = React.createRef();
		this.history = createBrowserHistory();
		
		this.loseGameFocus = this.loseGameFocus.bind(this);
		this.gainGameFocus = this.gainGameFocus.bind(this);
		this.onAuthSuccess = this.onAuthSuccess.bind(this);
		this.handleCloseAlert = this.handleCloseAlert.bind(this);
		this.onMinimize = this.onMinimize.bind(this);
		this.onMaximize = this.onMaximize.bind(this);
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

	loseGameFocus() {
		this.setState({focus: 'popup'});
	}

	gainGameFocus() {
		this.setState({focus: 'focused'});
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
			this.gameManager.setAuthToken(token);
			localStorage.setItem('authToken', token);
			console.log('authToken set: (decoded ver=)', decoded)
			this.setState({
				loggedIn: decoded.payload.registered
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

	onMaximize() {
		this.setState({focus: 'focused'});
	}

	onMinimize() {
		this.setState({focus: 'minimized'});
	}

	render() {
		return (
			<Router history={history}>
				<ChessNavbar loggedIn={this.state.loggedIn}/>
				{this.state.alert}
				<Route path="/home">
					<Home onMount={this.onMinimize} onUnmount={this.onMaximize}></Home>
				</Route>
				<Embed ref={this.embed} gameManager={this.gameManager} focus={this.state.focus} onMount={() => this.setState({focus: 'focused'})}></Embed>
				<Route path="/login">
					<Popup redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Login onSuccess={this.onAuthSuccess} alerter={this.alert}></Login>
					</Popup>
				</Route>
				<Route path="/register">
					<Popup redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Register onSuccess={this.onAuthSuccess} alerter={this.alert}></Register>
					</Popup>
				</Route>
				<Route path="/logout">
					<Popup redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Logout onSuccess={this.logout} alerter={this.alert}></Logout>
					</Popup>
				</Route>
			</Router>
		);
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;