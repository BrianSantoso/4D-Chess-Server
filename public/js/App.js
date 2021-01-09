import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Embed } from "./ClientGameManager.js";
import Register from './views/Register.jsx';
import Popup from './views/Popup.jsx';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			popup: true
		};

		this.exitPopup = this.exitPopup.bind(this);
	}
	
	exitPopup() {
		this.setState({popup: false});
	}

	render() {
		return (
			<div className=''>
				<Embed></Embed>
				{
					this.state.popup ? 
					<Popup handleExit={this.exitPopup}>
						<Register></Register>
					</Popup>
					: null 
				}
			</div>
		);
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;