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
			focused: false
		};
		this.history = createBrowserHistory();
		
		this.loseGameFocus = this.loseGameFocus.bind(this);
		this.gainGameFocus = this.gainGameFocus.bind(this);
		console.log(this.history)
		// history.goBack
	}

	loseGameFocus() {
		this.setState({focused: false});
	}

	gainGameFocus() {
		this.setState({focused: true});
	}

	render() {
		return (
			<Router history={history}>
				<ChessNavbar />
				<Embed focused={this.state.focused}></Embed>
				<Route path="/login">
					<Popup redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Login></Login>
					</Popup>
				</Route>
				<Route path="/register">
					<Popup redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
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