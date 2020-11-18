import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import WhiteIcon from '../assets/player/king_white.svg';
import BlackIcon from '../assets/player/king_black.svg';
import ChessGame from './ChessGame.js';

class View2D {
	constructor() {
//		this.root = (
//			<div>
//				<PlayerInfo team={ChessGame.WHITE}></PlayerInfo>
//				<PlayerInfo team={ChessGame.BLACK}></PlayerInfo>
//			</div>
//		);
		this.root = (
			<div>
			</div>
		);
	}
	
	draw() {
		// TODO: just call draw method once on load
		ReactDOM.render(this.root, document.getElementById('gui'));
	}
}

class PlayerInfo extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			team: this.props.team,
			time: 0,
			playerName: '',
		}
	}
	
	render() {
		const icon = this.props.team === ChessGame.BLACK ? BlackIcon : WhiteIcon;
		
		return (
			<div>
				<img src={icon}></img>
				<div> {this.state.playerName} </div>
				<div> {this.state.time} </div>
			</div>
		);
	}
}

export default View2D;