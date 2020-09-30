import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import WhiteIcon from '../assets/player/king_white.svg';
import BlackIcon from '../assets/player/king_black.svg';

class View2D {
	constructor() {
		this.root = (
			<div>
				<PlayerInfo></PlayerInfo>
			</div>
		);
	}
	
	draw() {
		ReactDOM.render(this.root, document.getElementById('gui'));
	}
}

class PlayerInfo extends Component {
	
	render() {
		return (
			<div>
				test
			</div>
		);
	}
}

export default View2D;