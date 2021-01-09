import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { ClientGameManager } from "./ClientGameManager.js";
import * as Colyseus from "colyseus.js";

import Register from './views/Register.jsx';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			popup: true
		};
		this._client = new Colyseus.Client("ws://localhost:3000");
		this._gameManager = new ClientGameManager(this._client);
		
		this._gameManager.loadAssets().then(() => {
			try {
				let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/)[1];
				this._gameManager.join(roomId);
			} catch {
				console.log('[App] No roomId parameter found');
				this._gameManager.join('standard');
			}

			this._gameManager._startLoop();
		});
	}

	componentDidMount() {
		this._gameManager.mount(this.mount);
	}

	render() {
		return (
			<div>
				<div id="embed" ref={ref => (this.mount = ref)}>
					{this._gameManager.overlay()}
				</div>
			</div>
		);
		// return this.state.popup ? (
		// 	<Register handleExit={()=>{this.setState({popup: false})}}></Register>
		// ) : null;
	}
}

App.main = function() {
	// let app = new App();
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

export default App;