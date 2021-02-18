import ChessTeam from './ChessTeam.js';
import EventHandler from './EventHandler.js';


import React, { Component } from 'react';
import config from './config.json';
import HomeIcon from '../assets/icons/home-black-rounded-24dp.svg';
import UndoIcon from '../assets/icons/undo-black-24dp.svg';
import RedoIcon from '../assets/icons/redo-black-24dp.svg';
import ChatIcon from '../assets/icons/chat-black-24dp.svg';
import { Chat, ChatMessage } from './gui/Chat.jsx';
import StatusBanner from './gui/StatusBanner.jsx';
import CircleButton from './gui/CircleButton.jsx';
import LayerStack from './gui/LayerStack.jsx';
import PlayerInfo from './gui/PlayerInfo.jsx';
import Home from './components/Home.jsx';

class View2D {
    constructor() {
		this.type;
    }

    to(type) {
        let delta = View2D.create(type);
        return Object.assign(this, delta);
    }
}

View2D.unwrap = (view2D) => {
    return view2D.view2D();
}

View2D.methods = {
    setState: (self) => {
        return (state) => {
            self._stateHelper.setState(state);
        }
    },

    setAddons: (self) => {
        return (addonsView2D) => {
            addonsView2D.setParentComponent(self);
            let addons = addonsView2D.getAddons();
            self.setState(addons);
        }
    },

    setGame: (self) => {
        return (game) => {
            self._game = game;
        }
    },

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
            self._game._gameManager.cameraHome()
        }
    },

    toggleChat: (self) => {
        return () => {
            self._parentComponent.setState(prevState => ({
                chatOpened: !prevState.chatOpened
            }));
        }
    },

    componentView2D: (self) => {
        return () => self._reactComponent;
    },

    addonsView2D: (self) => {
        return () => self;
    },

    getAddons: (self) => {
        return () => self._addons;
    },

    addonsSetParentComponent: (self) => {
        return (parentComponent) => {
            // parentComponent is a View2D object but can also be a react component,
            // since both have setState methods
            self._parentComponent = parentComponent;
        }
    },

    // addonsUpdate: (self, updater) => {
    //     return () => {
    //         // Trigger parent component's setState
    //         const result = updater();
    //         self._parentComponent.setAddons(self);
    //         return result;
    //     }
    // },

    layerStackAdd: (self) => {
        return (component, index) => {
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
        return (index) => {
            self.setState(prevState => {
                let arr = prevState.stack;
                if (typeof index !== 'number') {
                    index = arr.length - 1;
                }
                return {
                    stack: arr.slice(0, index).concat(arr.slice(index + 1))
                }
            });
        }
    }
};

View2D.LayerStack = () => {
    // TODO: make ClientGameManager use LayerStack instead
    let base = View2D.create('');
    let delta = {
        type: 'LayerStack',
        _layerStack: <LayerStack stateHelper={base._stateHelper}></LayerStack>,
        add: View2D.methods.layerStackAdd(base),
        pop: View2D.methods.layerStackPop(base)
    }
    return Object.assign(base, delta);
}

View2D.Component = () => {
    // A wrapper class that holds a React component and can change the state of that component externally
    let base = View2D.create('');
    let delta = {
        type: 'Component',
        _reactComponent: null,
        _stateHelper: {
			setStateHandler: (state) => console.log('setStateHandler not configured'),
			onStateChange: function(callback) {
				this.setStateHandler = callback;
			},
			setState: function(state) {
				this.setStateHandler(state);
			}
		},
        setState: View2D.methods.setState(base),
        setAddons: View2D.methods.setAddons(base),
        view2D: View2D.methods.componentView2D(base)
    };
    return Object.assign(base, delta);
}

View2D.Overlay = () => {
    let base = View2D.create('Component');
    let delta = {
        type: 'Overlay',
        _reactComponent: <Overlay stateHelper={base._stateHelper}></Overlay>,
    }
    return Object.assign(base, delta);
}

View2D.PlayerInfo = (props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'PlayerInfo',
        _reactComponent: <PlayerInfo {...props}></PlayerInfo>,
    }
    return Object.assign(base, delta);
}

View2D.CircleButton = (props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'CircleButton',
        _reactComponent: <CircleButton {...props}></CircleButton>,
    }
    return Object.assign(base, delta);
}

View2D.Addons = () => {
    // A modular attachment to a View2D.Component
    let base = View2D.create('');
    const delta = {
        type: 'Addons',
        _parentComponent: null,
        _addons: {}, // Addons are attachments to a react component's state. Just extra fields in a state object.
        setParentComponent: View2D.methods.addonsSetParentComponent(base),
        getAddons: View2D.methods.getAddons(base),
        view2D: View2D.methods.addonsView2D(base)
    };
    return Object.assign(base, delta);
}

View2D.BasicOverlayAddons = () => {
    let base = View2D.create('Addons');

    let playerLeft = View2D.create('PlayerInfo', {
        team: ChessTeam.WHITE,
        playerName: 'AnonCow',
        myTurn: true,
        time: 0,
        elo: 1000,
        position: 'playerInfoLeft',
        online: true
    });

    let playerRight = View2D.create('PlayerInfo', {
        team: ChessTeam.BLACK,
        playerName: 'AnonymousPig',
        myTurn: false,
        time: -1,
        elo: 1000,
        position: 'playerInfoRight',
        online: true
    })

    const delta = {
        type: 'BasicOverlayAddons',
        _addons: {
            topbar: [
                playerLeft,
                playerRight
            ],
            rightbar: [
                View2D.create('CircleButton', { icon: HomeIcon, handleClick: View2D.methods.cameraHome(base) }),
                View2D.create('CircleButton', { icon: UndoIcon, handleClick: View2D.methods.undo(base) }),
                View2D.create('CircleButton', { icon: RedoIcon, handleClick: View2D.methods.redo(base) }),
                View2D.create('CircleButton', { icon: ChatIcon, handleClick: View2D.methods.toggleChat(base) })
            ],
            leftbar: [],
            bottombar: [
                // <Chat 
				// 	room={} 
				// 	client={} 
				// 	chatOpened={} 
				// 	handleMsg={} 
				// 	handleOpenChat={} 
				// 	handleCloseChat={} 
				// 	messages={} 
				// 	showing={} 
				// 	events={}
				// />
            ],
        },
        _game: null,
        _playerLeft: playerLeft,
        _playerRight: playerRight,
        setGame: View2D.methods.setGame(base),
        update: () => {
            // get player data from base._game
            // base._playerLeft.setState()
        }
    }

    return Object.assign(base, delta);
}

View2D.create = (type, ...args) => {
    if (View2D[type]) {
        return View2D[type](...args);
    } else {
        return new View2D(...args);
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
                    {this.state.topbar.map(View2D.unwrap)}
                </div>

                <div className='overlay-leftbar'>
                    {this.state.leftbar.map(View2D.unwrap)}
                </div>
                
                <div className='overlay-rightbar'>
                    {this.state.rightbar.map(View2D.unwrap)}
                </div>

                <div className='overlay-bottombar'>
                    {this.state.bottombar.map(View2D.unwrap)}
                </div>
            </div>
        );
    }
}

export default View2D;