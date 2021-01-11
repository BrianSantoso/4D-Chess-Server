import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from "react-router-dom";
import { Embed } from "./ClientGameManager.js";
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Popup from './components/Popup.jsx';
import ChessNavbar from './components/Navbar.jsx';

import { createBrowserHistory } from "history";
const history = createBrowserHistory();

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// popup: true
		};

		this.exitPopup = this.exitPopup.bind(this);
	}

	exitPopup() {
		// this.setState({popup: false});
		// this.props.history.goBack();
		console.log(history);
		history.goBack();
	}

	render() {
		return (
			<Router history={history}>
				<ChessNavbar />
				<Embed></Embed>
				<Route path="/login">
					<Popup handleExit={this.exitPopup}>
						<Login></Login>
					</Popup>
				</Route>
				<Route path="/register">
					<Popup handleExit={this.exitPopup}>
						<Register></Register>
					</Popup>
				</Route>
			</Router>
		);
		// return (
		// 	<div className=''>
		// 		<Embed></Embed>
		// 		{
		// 			this.state.popup ? 
		// 			<Popup handleExit={this.exitPopup}>
		// 				<Register></Register>
		// 			</Popup>
		// 			: null 
		// 		}
		// 	</div>
		// );
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;