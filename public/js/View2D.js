import React, { Component } from 'react';
import EventHandler from './EventHandler.js';
import config from './config.json';
import HomeIcon from '../assets/icons/home-black-rounded-24dp.svg';
import UndoIcon from '../assets/icons/undo-black-24dp.svg';
import RedoIcon from '../assets/icons/redo-black-24dp.svg';
import ChatIcon from '../assets/icons/chat-black-24dp.svg';
import { Chat, ChatMessage } from './gui/Chat.jsx';
import StatusBanner from './gui/StatusBanner.jsx';

// A wrapper class that holds a React component and can change the state of that component externally
class View2D {
    constructor() {
		this.type;
		this.root = React.createRef();
		this._game;
		this._reactComponentType
		this._reactComponent;
		this._stateHelper = {
			setStateHandler: (state) => {},
			onStateChange: function(callback) {
				this.setStateHandler = callback;
			},
			setState: function(state) {
				this.setStateHandler(state);
			}
		};
    }

    toJSON() {
        return this.type;
    }

    to(type) {
        let delta = View2D.create(type);
        return Object.assign(this, delta);
    }

    // to(type, props={}) {
    //     let delta = View2D[type]()
	// 	Object.assign(this, delta);

	// 	Object.assign(props, {
	// 		stateHelper: this._stateHelper
	// 	});
	// 	let children = [];

	// 	this._reactComponent = React.createElement(
	// 		this._reactComponentType,
	// 		props,
	// 		children
	// 	);
	// 	return this;
    // }

    setGame(game) {
        this._game = game;
    }

    view2D() {
		return this._reactComponent;
	}
}

View2D.BasicGUI = () => {
    let base = View2D.create();
    
    const delta = {
		type: 'BasicGUI',
        _reactComponent: <Overlay stateHelper={base._stateHelper}></Overlay>
    };

    return Object.assign(base, delta);
}

View2D.create = (type) => {
    // let base = new View2D();
    // return base.to(type);
    if (type) {
        return View2D[type]();
    } else {
        return new View2D();
    }
}

class Overlay extends Component {
	constructor(props) {
        super(props);
        this.state = {

        };
		this.props.stateHelper.onStateChange((state) => {this.setState(state)});
	}

	render() {
		return (
            <div className='overlay'>
                {this.state.playerLeft}
                <StatusBanner message={bannerMessage}></StatusBanner>
                {this.state.playerRight}
                
                <div className='sidebar'>
                    <CircleButton icon={HomeIcon} handleClick={this.props.cameraHome}></CircleButton>
                    <CircleButton icon={UndoIcon} handleClick={this.props.undo}></CircleButton>
                    <CircleButton icon={RedoIcon} handleClick={this.props.redo}></CircleButton>
                    <CircleButton icon={ChatIcon} handleClick={this.toggleChat}></CircleButton>
                </div>

                <Chat 
                    room={this.state.room} 
                    client={this.props.client} 
                    chatOpened={this.state.chatOpened} 
                    handleMsg={this.addMsg} 
                    handleOpenChat={this.openChat} 
                    handleCloseChat={this.closeChat} 
                    messages={this.state.messages} 
                    showing={this.state.showing} 
                    events={this.props.events}
                />
            </div>
        );
	}
}

export default View2D;