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
        this.name;
		this._stateHelper = {
			setStateHandler: (state) => console.log('setStateHandler not configured'),
			onStateChange: function(callback) {
				this.setStateHandler = callback;
			},
			setState: function(state) {
				this.setStateHandler(state);
			}
		};
    }

    setState(state) {
        this._stateHelper.setState(state);
    }

    toJSON() {
        return this.type;
    }

    update() {
        
    }

    to(type) {
        let delta = View2D.create(type);
        return Object.assign(this, delta);
    }
}

View2D.methods = {
    undo: (self) => {
        return () => {
            self._game.undo()
        }
    },

    redo: (self) => {
        return () => {
            self._game.redo()
        }
    },

    cameraHome: (self) => {
        return () => {
            self.cameraHome()
        }
    },

    toggleChat: (self) => {
        return () => {
            self._parentComponent.setState(prevState => ({
                chatOpened: !prevState.chatOpened
            }));
        }
    },

    overlayView2D: (self) => {
        return () => self._reactComponent;
    },

    layerStackAdd: (self) => {
        return (component, name, index) => {
            self._stateHelper.setState(prevState => {
                let arr = prevState.stack;
                if (typeof index !== 'number') {
                    index = arr.length;
                }
                return {
                    stack: arr.slice(0, index).concat([component]).concat(arr.slice(index))
                }
            });
        }
    },

    layerStackPop: (self) => {
        return (name, indexOrName) => {
            self.setState(prevState => {
                let arr = prevState.stack;
                let index;
                if (typeof indexOrName === 'number') {
                    index = indexOrName;
                } else {
                    let name = indexOrName;
                    index = prevState.indexOf(name); // TODO: look up by name
                }
                return {
                    stack: arr.slice(0, index).concat(arr.slice(index + 1))
                }
            });
        }
    }
};

View2D.LayerStack = (name) => {
    let base = View2D.create('', name);
    let delta = {
        type: 'LayerStack',
        _layerStack: <LayerStack stateHelper={base._stateHelper}></LayerStack>,
        add: View2D.methods.layerStackAdd(base),
        pop: View2D.methods.layerStackPop(base)
    }
    return Object.assign(base, delta);
}

View2D.Overlay = (name) => {
    let base = View2D.create('', name);
    let delta = {
        type: 'Overlay',
        _reactComponent: <Overlay stateHelper={base._stateHelper}></Overlay>,
        view2D: View2D.methods.overlayView2D(base)
    }
    return Object.assign(base, delta);
}

View2D.BasicOverlayAddons = (name) => {
    let base = View2D.create(name);
    
    // const delta = {
	// 	type: 'BasicGUI',
    //     _reactComponent: <BasicOverlayAddons 
    //                         stateHelper={base._stateHelper} 
    //                         undo={View2D.methods.undo(base)}
    //                         redo={View2D.methods.redo(base)}></BasicOverlayAddons>
    // };
    const delta = {
        type: 'BasicOverlayAddons',
        _parentComponent: null,
        _topbar: [],
        _rightbar: [
            <CircleButton icon={UndoIcon} handleClick={View2D.methods.undo(base)}></CircleButton>,
            <CircleButton icon={RedoIcon} handleClick={View2D.methods.redo(base)}></CircleButton>,
            <CircleButton icon={ChatIcon} handleClick={View2D.methods.toggleChat(base)}></CircleButton>
        ],
        _leftbar: [],
        _bottombar: []
    }

    return Object.assign(base, delta);
}

View2D.create = (type, name) => {
    if (View2D[type]) {
        return View2D[type](name);
    } else {
        return new View2D(name);
    }
}

class Overlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            topbar: [],
            leftbar: [],
            rightbar: [],
            bottombar: []
        };
        this.props.stateHelper.onStateChange((state) => {this.setState(state)});
    }

    render() {
        return (
            <div className='overlay'>
                <div className='overlay-topbar'>
                    {this.state.topbar}
                </div>

                <div className='overlay-leftbar'>
                    {this.state.leftbar}
                </div>
                
                <div className='overlay-rightbar'>
                    {this.state.rightbar}
                </div>

                <div className='overlay-bottombar'>
                    {this.state.bottombar}
                </div>
            </div>
        );
    }
}

// class BasicOverlayAddons extends Component {
// 	constructor(props) {
//         super(props);
//         this.state = {
//             chatOpened: false,
//         };
// 		this.props.stateHelper.onStateChange((state) => {this.setState(state)});
// 	}

// 	render() {
// 		return (
//             <div className='overlay'>
//                 {this.state.playerLeft}
//                 <StatusBanner message={bannerMessage}></StatusBanner>
//                 {this.state.playerRight}
                
//                 <div className='sidebar'>
//                     <CircleButton icon={HomeIcon} handleClick={this.props.cameraHome}></CircleButton>
//                     <CircleButton icon={UndoIcon} handleClick={this.props.undo}></CircleButton>
//                     <CircleButton icon={RedoIcon} handleClick={this.props.redo}></CircleButton>
//                     <CircleButton icon={ChatIcon} handleClick={this.toggleChat}></CircleButton>
//                 </div>

//                 <Chat 
//                     room={this.state.room} 
//                     client={this.props.client} 
//                     chatOpened={this.state.chatOpened} 
//                     handleMsg={this.addMsg} 
//                     handleOpenChat={this.openChat} 
//                     handleCloseChat={this.closeChat} 
//                     messages={this.state.messages} 
//                     showing={this.state.showing} 
//                     events={this.props.events}
//                 />
//             </div>
//         );
// 	}
// }

export default View2D;