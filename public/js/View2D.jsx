import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';
//import WhiteIcon from '../assets/player/king_white.svg';
//import BlackIcon from '../assets/player/king_black.svg';
import ChessGame from './ChessGame.js';
import HomeIcon from '../assets/icons/home-black-rounded-24dp.svg';
import UndoIcon from '../assets/icons/undo-black-24dp.svg';
import RedoIcon from '../assets/icons/redo-black-24dp.svg';
import ChatIcon from '../assets/icons/chat-black-24dp.svg';

class View2D {
	constructor(gameManager) {
		this._gameManager = gameManager;
		
		this.cameraHome = this.cameraHome.bind(this);
		this.undo = this.undo.bind(this);
		this.redo = this.redo.bind(this);
		// TODO: implement chat later
		this.chat = <Chat />
		let test = () => {
			console.log(this.chat.messages)
			this.chat.test();
		}
		
		this.root = (
			<div className='overlay'>
				<PlayerInfo team={ChessGame.WHITE} playerName={'Guest8449947756'}></PlayerInfo>
				<PlayerInfo team={ChessGame.BLACK} playerName={'AnonymousCow'}></PlayerInfo>
				
				<div className='sidebar'>
					<CircleButton icon={HomeIcon} handleClick={this.cameraHome}></CircleButton>
					<CircleButton icon={UndoIcon} handleClick={this.undo}></CircleButton>
					<CircleButton icon={RedoIcon} handleClick={this.redo}></CircleButton>
					<CircleButton icon={ChatIcon} handleClick={test}></CircleButton>
				</div>
				{this.chat}
			</div>
		);
	}
	
	cameraHome() {
		this._gameManager.cameraHome();
	}

	undo() {
		this._gameManager.undo();
	}

	redo() {
		this._gameManager.redo();
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
			time: -1,
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

class Chat extends Component {
	constructor(props) {
		super(props);

		this.messages = [];
		
		this.state = {
			showing: []
		}
	}

	componentDidMount() {
		setTimeout(() => {
			this.addMsg({
				msg: '[Guest8449947756] good luck have fun!'
			});
			this.addMsg({
				msg: '[AnonymousCow] Thanks, you too'
			});
			this.addMsg({
				msg: 'AnonPig has joined the room'
			});
		}, 1000);
		
	}

	test() {
		this.addMsg({
			msg: '[Guest8449947756] good luck have fun!'
		});
		this.addMsg({
			msg: '[AnonymousCow] Thanks, you too'
		});
		this.addMsg({
			msg: 'AnonPig has joined the room'
		});
	}

	render() {
		return (
			<div className='chat'>
				<CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{this.state.showing}
				</CSSTransitionGroup>
			</div>
		);
	}

	addMsg(config) {
		// TODO: generate uuid for key
		let key = config.msg;
		let handleHide = this._getHideMsgHandler(key);
		let chatMsg = <ChatMessage key={key} text={config.msg} handleHide={handleHide} />;
		this.messages.push(chatMsg);
		
		// TODO: is callback needed in this setState?
		this.setState(prevState => ({
			showing: prevState.showing.concat([chatMsg])
		}));
	}

	_getHideMsgHandler(key) {
		return () => {
			// TODO: is callback needed in this setState?
			this.setState(prevState => ({
				showing: prevState.showing.filter(el => el.key !== key)
			}));
		}
	}
}

class ChatMessage extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		setTimeout(this.props.handleHide, 4000);
	}

	render() {
		return (
			<div className='chat-message'>
				{this.props.text}
			</div>
		);
	}
}

export default View2D;