import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from "react-router-dom";
import { Embed } from "./ClientGameManager.js";
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Popup from './components/Popup.jsx';
import ChessNavbar from './components/Navbar.jsx';
import { Alert } from 'react-bootstrap';
import { CSSTransitionGroup } from 'react-transition-group';
import { createBrowserHistory } from "history";

import jwt from 'jsonwebtoken';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false,
			loggedIn: false,
			alert: ''
		};
		this.embed = React.createRef();
		this.history = createBrowserHistory();
		
		this.loseGameFocus = this.loseGameFocus.bind(this);
		this.gainGameFocus = this.gainGameFocus.bind(this);
		this.onAuthSuccess = this.onAuthSuccess.bind(this);
		this.handleCloseAlert = this.handleCloseAlert.bind(this);
		this.alert = this.alert.bind(this);
		console.log(this.history)
		// history.goBack
	}

	loseGameFocus() {
		this.setState({focused: false});
	}

	gainGameFocus() {
		this.setState({focused: true});
	}

	handleCloseAlert() {
		this.setState({alert: ''});
	}

	onAuthSuccess(response) {
		this.setState({
			loggedIn: true
		});
		let token = jwt.decode(response.data.token, {complete: true});
		console.log('Token:', response.data.token, token)
		console.log(this.embed, this.embed.current)
		this.embed.current.setAuthToken(token);
	}

	alert(props) {
		this.setState({
			alert: (
				<Alert className="alert-banner" 
				variant={props.variant} 
				onClose={this.handleCloseAlert} 
				dismissible> {props.content} </Alert>
			)
		});
	}

	render() {
		return (
			<Router history={history}>
				<ChessNavbar loggedIn={this.state.loggedIn}/>
				{this.state.alert}
				<Embed ref={this.embed} focused={this.state.focused}></Embed>
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
			</Router>
		);
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;