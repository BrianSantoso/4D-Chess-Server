import React, { Component } from 'react';
import ReactDOM from 'react-dom';
//import WhiteIcon from '../assets/player/king_white.svg';
//import BlackIcon from '../assets/player/king_black.svg';
import ChessGame from './ChessGame.js';
import HomeIcon from '../assets/icons/home-black-rounded-24dp.svg';

class View2D {
	constructor(gameManager) {
		this._gameManager = gameManager;
		
		this.cameraHome = this.cameraHome.bind(this);
		// TODO: implement chat later
		let chat = (<div className='chat'>
			<ul className='chat-message'>
				<li> [Guest8449947756] good luck have fun </li>
				<li> [AnonymousCow] Thanks, you too! </li>
			</ul>
		</div>);
		
		this.root = (
			<div className='overlay'>
				<PlayerInfo team={ChessGame.WHITE} playerName={'Guest8449947756'}></PlayerInfo>
				<PlayerInfo team={ChessGame.BLACK} playerName={'AnonymousCow'}></PlayerInfo>
				
				<div className='sidebar'>
					<CircleButton icon={HomeIcon} handleClick={this.cameraHome}></CircleButton>
				</div>
			</div>
		);
	}
	
	cameraHome() {
		this._gameManager.cameraHome();
	}
	
	draw() {
		// TODO: just call draw method once on load
		ReactDOM.render(this.root, document.getElementById('react-root'));
	}
}

class PlayerInfo extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			team: this.props.team,
			time: 65000,
			playerName: this.props.playerName,
		}
	}
	
	msToHMS(duration) {
		if (duration < 0) {
			return '--:--'
		}
		// https://stackoverflow.com/a/54821863
		let milliseconds = parseInt((duration % 1000) / 100),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;
		
		return minutes + ":" + seconds;
		
	}
	
	render() {
		let className;
		let footer;
		let playerTime = <div className='playerTime'>{this.msToHMS(this.state.time)}</div>;
		let playerStatus = <img className='playerStatus' src='../assets/player/online.svg' />
		
		if (this.state.team === ChessGame.WHITE) {
			className = 'playerInfo playerWhite';
			footer = (
				<div className='playerFooter'>
					{playerTime}
					{playerStatus}
				</div>
			)
		} else {
			className = 'playerInfo playerBlack';
			footer = (
				<div className='playerFooter'>
					{playerStatus}
					{playerTime}
				</div>
			)
		}
			
		return (
			<div className={className}>
				<img className='playerIcon' />
				<div className='playerText'>
					<div className='playerName'>
						{this.state.playerName}
					</div>
					{footer}
				</div>
			</div>
		)
	}
}

class CircleButton extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<a className='game-button' onClick={this.props.handleClick} >
				<img src={this.props.icon} />
			</a>
		)
	}
}

export default View2D;