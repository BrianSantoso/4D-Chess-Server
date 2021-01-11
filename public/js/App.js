import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from "react-router-dom";
import { Embed } from "./ClientGameManager.js";
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Popup from './components/Popup.jsx';
import ChessNavbar from './components/Navbar.jsx';
import { CSSTransitionGroup } from 'react-transition-group';
import { createBrowserHistory } from "history";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			
		};
		this.history = createBrowserHistory();
		
		this.exitPopup = this.exitPopup.bind(this);
		console.log(this.history)
	}

	focusedOnGame() {
		// TODO: how to determine if focused on game? Using path may not work because one could be typing in navbar...
		return this.history.location.pathname === '/';
	}

	exitPopup() {
		// this.setState({popup: false});
		// this.props.history.goBack();
		// console.log(history);
		// history.goBack();
		// history.push('/');
	}

	render() {
		return (
			<Router history={history}>
				<ChessNavbar />
				<Embed focused={this.focusedOnGame()}></Embed>
				<Route path="/login">
					<Popup redirect='/'>
						<Login></Login>
					</Popup>
				</Route>
				<Route path="/register">
					<Popup redirect='/'>
						<Register></Register>
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