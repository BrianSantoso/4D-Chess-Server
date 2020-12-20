import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import FocusLock from 'react-focus-lock';
import WhiteIcon from '../assets/player/king_white.svg';
import BlackIcon from '../assets/player/king_black.svg';
import ChessGame from './ChessGame.js';
import EventHandler from './EventHandler.js';
import HomeIcon from '../assets/icons/home-black-rounded-24dp.svg';
import UndoIcon from '../assets/icons/undo-black-24dp.svg';
import RedoIcon from '../assets/icons/redo-black-24dp.svg';
import ChatIcon from '../assets/icons/chat-black-24dp.svg';
import config from './config.json';

class View2D {
	constructor(gameManager) {
		this._gameManager = gameManager;
		
		this.cameraHome = this.cameraHome.bind(this);
		this.undo = this.undo.bind(this);
		this.redo = this.redo.bind(this);
		
		this.root = React.createRef();
		
		this._events = new EventHandler(document);
		this._events.defineKeyboardEvent('openChat', ['Enter', 'KeyC', 'KeyT', 'KeyY']);
		this._events.defineKeyboardEvent('closeChat', ['Escape']);
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
		ReactDOM.render(<Overlay ref={this.root} cameraHome={this.cameraHome} undo={this.undo} redo={this.redo} events={this._events}/>, document.getElementById('react-root'));
	}
}

class Overlay extends Component {

	constructor(props) {
		super(props);

		// this.messages = [];
		this.state = {
			messages: [],
			showing: [],
			chatOpened: false // chat state is maintained up here so that toggle chat button can toggle chat
		}

		this.addMsg = this.addMsg.bind(this);
		this.toggleChat = this.toggleChat.bind(this);
		this.openChat = this.openChat.bind(this);
		this.closeChat = this.closeChat.bind(this);
	}

	render() {
		return (
			<div className='overlay'>
				<PlayerInfo team={ChessGame.WHITE} playerName={'You'} myTurn={true} time={-1} elo={2100} position={'playerInfoLeft'}></PlayerInfo>
				<StatusBanner messages={config.banner.noOpponent}></StatusBanner>
				<PlayerInfo team={ChessGame.BLACK} playerName={'Guest8449947756'} myTurn={false} time={-1} elo={2450} position={'playerInfoRight'}></PlayerInfo>
				
				<div className='sidebar'>
					<CircleButton icon={HomeIcon} handleClick={this.props.cameraHome}></CircleButton>
					<CircleButton icon={UndoIcon} handleClick={this.props.undo}></CircleButton>
					<CircleButton icon={RedoIcon} handleClick={this.props.redo}></CircleButton>
					<CircleButton icon={ChatIcon} handleClick={this.toggleChat}></CircleButton>
				</div>
				<Chat chatOpened={this.state.chatOpened} handleMsg={this.addMsg} handleOpenChat={this.openChat} handleCloseChat={this.closeChat} messages={this.state.messages} showing={this.state.showing} events={this.props.events}/>
			</div>
		);
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
	
	componentWillUnmount() {
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
			chatOpened: !prevState.chatOpened
		}));
	}

	openChat() {
		this.setState({
			chatOpened: true
		});
	}

	closeChat() {
		this.setState({
			chatOpened: false
		});
	}
}

class PlayerInfo extends Component {
	
	constructor(props) {
		super(props);
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
		let className = 'playerInfo ' + this.props.position;
		let isWhite = this.props.team === ChessGame.WHITE;
		let playerTime = <div className='playerTime'>{this.msToHMS(this.props.time)}</div>;
		let playerStatus = <img className='playerStatus' src='../assets/player/online.svg' />
		let playerIcon = <img className='playerIcon' src={isWhite ? WhiteIcon : BlackIcon}/>;
		let elo = `(${this.props.elo})`;
		let footer = (
			<div className='playerFooter'>
				{elo}
				{playerStatus}
				{playerTime}
			</div>
		);
			
		return (
			<div className={className}>
				{playerIcon}
				<div className='playerText'>
					<div className='playerName'>
						{this.props.playerName}
					</div>
					{footer}
				</div>
			</div>
		)
	}
}

class StatusBanner extends Component {
	constructor(props) {
		super(props);
		this.state = {
			frame: 0
		}

		this.tick = this.tick.bind(this);
	}

	tick() {
		this.setState(prevState => ({
			frame: (prevState.frame + 1) % this.props.messages.length
		}));
	}

	currMessage() {
		return this.props.messages[this.state.frame];
	}

	componentDidMount() {
		this.timerID = setInterval(this.tick, config.banner.msPerMsg);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	render() {
		return (
			<div className='statusBanner'>
				{this.currMessage()}
			</div>
		);
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
				{ this.props.chatOpened ? 
					<ChatOpened handleCloseChat={this.props.handleCloseChat}
					handleMsg={this.props.handleMsg} 
					messages={this.props.messages} 
					events={this.props.events}></ChatOpened> 
				: 
					<ChatClosed handleOpenChat={this.props.handleOpenChat} showing={this.props.showing} events={this.props.events}></ChatClosed> 
				}
			</div>
		);
	}
}

class ChatClosed extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
				{ this.props.showing }
			</CSSTransitionGroup>
		);
	}

	componentDidMount() {
		this.props.events.subscribe(this, 'openChat');
	}

	componentWillUnmount() {
		this.props.events.unsubscribe(this, 'openChat');
	}

	openChat(event) {
		event.preventDefault();
		console.log(event)
		this.props.handleOpenChat();
	}
}

class ChatOpened extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className=''>
				<CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{ this.props.messages }
				</CSSTransitionGroup>
				<ChatInput handleCloseChat={this.props.handleCloseChat} handleMsg={this.props.handleMsg}></ChatInput>
			</div>
		);
	}

	componentDidMount() {
		this.props.events.subscribe(this, 'closeChat');
	}

	componentWillUnmount() {
		this.props.events.unsubscribe(this, 'closeChat');
	}

	closeChat(event) {
		event.preventDefault();
		console.log(event)
		this.props.handleCloseChat();
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
					<input className='chat-message' type="text" value={this.state.value} onChange={this._handleChange} maxLength={config.chat.maxLength} autoFocus={true}></input>
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
			// this.props.handleCloseChat();
		}
		this.props.handleCloseChat();
	}

	_clear() {
		this.setState({
			value: ''
		});
	}
}

export default View2D;