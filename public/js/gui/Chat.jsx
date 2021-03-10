import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import FocusLock from 'react-focus-lock';
import config from '../config.json'

class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = props;
		this.props.stateHelper.onStateChange((state) => {this.setState(state)});
	}

	render() {
		return (
			<div className='chat'>
				{ this.state.chatOpened ? 
					<ChatOpened 
					handleCloseChat={() => this.setState({ chatOpened: false })}
					handleMsg={this.state.handleMsg} 
					messages={this.state.messages} 
					events={this.state.events}></ChatOpened> 
				: 
					<ChatClosed 
					handleOpenChat={() => this.setState({ chatOpened: true })} 
					showing={this.state.showing} 
					events={this.state.events}></ChatClosed> 
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
		console.log('trying to open chat')
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
				<ChatInput room={this.props.room} client={this.props.client} handleCloseChat={this.props.handleCloseChat} handleMsg={this.props.handleMsg}></ChatInput>
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
		setTimeout(this.props.handleHide, 4000); // TODO add display time to config.json
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

			let message = {
				msg: text,
				// NOTE: this can likely be removed as client is not passed in as a prop anymore
				sender: this.props.client // This field is only necessary for local games. Is overwritten by server if online
			}

			this.props.handleMsg(message);
			// if (this.props.room) {
			// 	this.props.room.send('chatMsg', message);
			// } else {
			// 	this.props.handleMsg(message);
			// }

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

export { Chat, ChatMessage }