import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import FocusLock from 'react-focus-lock';
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
		
		this.root = React.createRef();
		
	}

	keydown(event) {
		this.root.current.keydown(event);
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
		ReactDOM.render(<Overlay ref={this.root} cameraHome={this.cameraHome} undo={this.undo} redo={this.redo} />, document.getElementById('react-root'));
	}
}

class Overlay extends Component {

	constructor(props) {
		super(props);

		// this.messages = [];
		this.state = {
			messages: [],
			showing: [],
			chatOpen: false,
			focused: true // set false when embed is minimized
		}

		this.keybinds = {
			TOGGLE_CHAT: new Set(['Enter']), // Enter
			OPEN_CHAT: new Set(['Enter', 'KeyC', 'KeyT', 'KeyY']), // C, T, Y
			CLOSE_CHAT: new Set(['Escape']), // Escape
			UNDO: new Set(['ArrowLeft']),
			REDO: new Set(['ArrowRight'])
		};

		this.toggleChat = this.toggleChat.bind(this);
		this.addMsg = this.addMsg.bind(this);
		this.closeChat = this.closeChat.bind(this);
		this._handleKeyPress = this._handleKeyPress.bind(this);
	}

	render() {
		return (
			<div className='overlay' onKeyPress={this._handleKeyPress}>
				<PlayerInfo team={ChessGame.WHITE} playerName={'Guest8449947756'}></PlayerInfo>
				<PlayerInfo team={ChessGame.BLACK} playerName={'AnonymousCow'}></PlayerInfo>
				
				<div className='sidebar'>
					<CircleButton icon={HomeIcon} handleClick={this.props.cameraHome}></CircleButton>
					<CircleButton icon={UndoIcon} handleClick={this.props.undo}></CircleButton>
					<CircleButton icon={RedoIcon} handleClick={this.props.redo}></CircleButton>
					<CircleButton icon={ChatIcon} handleClick={this.toggleChat}></CircleButton>
				</div>
				<Chat messages={this.state.messages} showing={this.state.showing} chatOpen={this.state.chatOpen} handleMsg={this.addMsg} handleCloseChat={this.closeChat}/>
			</div>
		);
	}

	keydown(event) {
		if (!this.state.focused) {
			return;
		}
		// TODO: figure out how to utilize state pattern with react components.
		// Finding a way to force focus would fix all problems...
		let key = event.code;
		if (this.keybinds['OPEN_CHAT'].has(key)) {
			if (!this.state.chatOpen) {
				this.openChat();
				event.preventDefault();
			}
		} else {
		}
	}

	addMsg(config) {
		// TODO: generate uuid for key
		let key = config.msg + Date.now();
		let handleHide = this._getHideMsgHandler(key);
		let chatMsg = <ChatMessage key={key} text={config.msg} style={config.style} sender={config.sender} handleHide={handleHide} />;
		// this.messages.push(chatMsg);
		
		// TODO: is callback needed in this setState?
		this.setState(prevState => ({
			messages: prevState.messages.concat([chatMsg]),
			showing: prevState.showing.concat([chatMsg])
		}));
	}

	_handleKeyPress(event) {
		console.log(event.key)
		if (event.key === 'Enter' && !this.state.chatOpen) {
			this.openChat();
		}
	}

	_getHideMsgHandler(key) {
		return () => {
			// TODO: is callback needed in this setState?
			this.setState(prevState => ({
				showing: prevState.showing.filter(el => el.key !== key)
			}));
		}
	}

	componentDidMount() {
		setTimeout(this.test.bind(this), 1000);
	}

	test() {
		this.addMsg({
			msg: '[Guest8449947756] good luck have fun!'
		});
		this.addMsg({
			msg: '[AnonymousCow] Thanks, you too'
		});
		this.addMsg({
			msg: 'AnonPig has joined the room',
			style: {
				color: 'rgb(255, 251, 13)'
			}
		});
	}

	toggleChat() {
		this.setState(prevState => ({
			chatOpen: !prevState.chatOpen
		}));
	}

	openChat() {
		this.setState({
			chatOpen: true
		});
	}

	closeChat() {
		this.setState({
			chatOpen: false
		});
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
			<a className='game-button' onClick={this.props.handleClick}>
				<img src={this.props.icon} />
			</a>
		)
	}
}

class Chat extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='chat'>
				{ this.props.chatOpen ? this._opened() : this._notOpened() }
			</div>
		);
	}

	_opened() {
		return (
			<div className=''>
				<CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{ this.props.messages }
				</CSSTransitionGroup>
				<ChatInput handleMsg={this.props.handleMsg} handleCloseChat={this.props.handleCloseChat}></ChatInput>
			</div>
		);
	}

	_notOpened() {
		// console.log('showing', this.props.showing)
		return (
			<CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
				{ this.props.showing }
			</CSSTransitionGroup>
		);
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
		let senderStr = this.props.sender ? `[${this.props.sender}] ` : '';
		return (
			<div className='chat-message'>
				<span style={this.props.style}> {senderStr + this.props.text} </span>
			</div>
		);
	}
}

// class ChatInput extends Component {
// 	constructor(props) {
// 		super(props);
// 		// TODO: Use a controlled component instead, and handle input inside
// 		// this react component instead of in the DOM
// 		this.textInput = React.createRef();

// 		this._handleKeyDown = this._handleKeyDown.bind(this);
// 		this._handleEnter = this._handleEnter.bind(this);
// 	}

// 	componentDidMount() {
// 		this.textInput.current.focus();
// 	}

// 	render() {
// 		return (
// 			<div ref={this.textInput} contentEditable={true} className='chat-message' onKeyDown={this._handleKeyDown}></div>
// 		);
// 	}

// 	_handleKeyDown(event) {
// 		if (event.key === 'Enter') {
// 			this._handleEnter();
// 		}
// 	}

// 	_handleEnter() {
// 		let text = this.textInput.current.innerText;
// 		// TODO: sanitize
// 		console.log('text:', text)
// 		if (text) {
// 			this.props.handleMsg({
// 				msg: text
// 			});
// 			this.textInput.current.innerText = '';
// 		} else {
// 			this.props.handleCloseChat();
// 		}
// 	}
// }

class ChatInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value: ''
		};

		this._handleChange = this._handleChange.bind(this);
		this._handleSubmit = this._handleSubmit.bind(this);
	}

	render() {
		return (
			<FocusLock>
				<form onSubmit={this._handleSubmit}>
					<input className='chat-message' type="text" value={this.state.value} onChange={this._handleChange} autoFocus={true}></input>
				</form>
			</FocusLock>
		);
	}

	_handleChange(event) {
		this.setState({value: event.target.value});
	}

	_handleSubmit(event) {
		event.preventDefault();
		let text = this.state.value;
		// TODO: sanitize input if not already handled natively by react
		if (text) {
			console.log('text:', text)
			this.props.handleMsg({
				msg: text,
				sender: 'AnonPig'
			});
			this._clear();
		} else {
			this.props.handleCloseChat();
		}
	}

	_clear() {
		this.setState({
			value: ''
		});
	}
}

export default View2D;