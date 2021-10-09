"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
const EventHandler_js_1 = tslib_1.__importDefault(require("./EventHandler.js"));
const react_1 = tslib_1.__importStar(require("react"));
const home_black_rounded_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/home-black-rounded-24dp.svg"));
const undo_black_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/undo-black-24dp.svg"));
const redo_black_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/redo-black-24dp.svg"));
const chat_black_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/chat-black-24dp.svg"));
const Chat_jsx_1 = require("./gui/Chat.jsx");
const CircleButton_jsx_1 = tslib_1.__importDefault(require("./gui/CircleButton.jsx"));
const LayerStack_jsx_1 = tslib_1.__importDefault(require("./gui/LayerStack.jsx"));
const PlayerInfo_jsx_1 = tslib_1.__importDefault(require("./gui/PlayerInfo.jsx"));
const Game_jsx_1 = tslib_1.__importDefault(require("./components/Game.jsx"));
const react_bootstrap_1 = require("react-bootstrap");
const Alerter_jsx_1 = tslib_1.__importDefault(require("./components/Alerter.jsx"));
const Navbar_jsx_1 = tslib_1.__importDefault(require("./components/Navbar.jsx"));
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
};
View2D.methods = {
    setState: (self) => {
        return (state) => {
            self._stateHelper.setState(state);
        };
    },
    setAddons: (self) => {
        return (addonsView2D) => {
            addonsView2D.setParentComponent(self);
            let addons = addonsView2D.getAddons();
            self.setState(addons);
        };
    },
    setGame: (self) => {
        return (game) => {
            self._game = game;
        };
    },
    undo: (self) => {
        return () => {
            self._game.undo();
        };
    },
    redo: (self) => {
        return () => {
            self._game.redo();
        };
    },
    cameraHome: (self) => {
        return () => {
            self._game._gameManager.cameraHome();
        };
    },
    toggleChat: (self) => {
        return () => {
            // self._parentComponent.setState(prevState => ({
            //     // chatOpened: !prevState.chatOpened
            //     bottombar: [self._chat]
            // }));
            self._chat.setState(prevState => ({
                chatOpened: !prevState.chatOpened
            }));
        };
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
        };
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
                };
            });
        };
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
                };
            });
        };
    },
};
View2D.LayerStack = () => {
    // TODO: make ClientGameManager use LayerStack instead
    let base = View2D.create('');
    let delta = {
        type: 'LayerStack',
        _layerStack: <LayerStack_jsx_1.default stateHelper={base._stateHelper}></LayerStack_jsx_1.default>,
        add: View2D.methods.layerStackAdd(base),
        pop: View2D.methods.layerStackPop(base)
    };
    return Object.assign(base, delta);
};
View2D.Component = () => {
    // A wrapper class that holds a React component and can change the state of that component externally
    let base = View2D.create('');
    let delta = {
        type: 'Component',
        _reactComponent: null,
        _stateHelper: {
            setStateHandler: (state) => console.log('setStateHandler not configured for', base),
            onStateChange: function (callback) {
                this.setStateHandler = callback;
            },
            setState: function (state) {
                this.setStateHandler(state);
            }
        },
        setState: View2D.methods.setState(base),
        setAddons: View2D.methods.setAddons(base),
        view2D: View2D.methods.componentView2D(base)
    };
    return Object.assign(base, delta);
};
View2D.Alerter = (props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'Alerter',
        _reactComponent: <Alerter_jsx_1.default {...props} stateHelper={base._stateHelper}></Alerter_jsx_1.default>,
        alert: (alertProps) => {
            let key = Date.now() + '';
            let handleHide = () => {
                base.setState(prevState => ({
                    // remove alert from showing
                    showing: prevState.showing.filter(el => el.key !== key)
                }));
            };
            let alert = <react_bootstrap_1.Alert {...alertProps} key={key} className="alert-banner" onClose={handleHide} dismissible>
                    {alertProps.content}
                </react_bootstrap_1.Alert>;
            base.setState(prevState => ({
                showing: prevState.showing.concat([alert])
            }));
        }
    };
    return Object.assign(base, delta);
};
View2D.ChessNavbar = (authenticator, props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'ChessNavbar',
        _reactComponent: <Navbar_jsx_1.default {...props} stateHelper={base._stateHelper}></Navbar_jsx_1.default>,
        _authenticator: authenticator,
        onAccountChange: (token) => {
            let loggedIn = base._authenticator.loggedIn();
            base.setState({
                loggedIn: loggedIn
            });
        }
    };
    Object.assign(base, delta);
    authenticator.subscribe(base);
    return base;
};
View2D.Game = (gameManager, props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'Game',
        _reactComponent: <Game_jsx_1.default {...props} stateHelper={base._stateHelper} gameManager={gameManager}></Game_jsx_1.default>,
        _gameManager: gameManager,
        setFocus: (focusState) => {
            base.setState({
                focusState: focusState
            });
            // base._gameManager.setFocus(focusState);
        }
    };
    // gameManager.setFocus(props.focusState);
    Object.assign(base, delta);
    return base;
};
View2D.Overlay = () => {
    let base = View2D.create('Component');
    let delta = {
        type: 'Overlay',
        _reactComponent: <Overlay stateHelper={base._stateHelper}></Overlay>,
    };
    return Object.assign(base, delta);
};
View2D.PlayerInfo = (props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'PlayerInfo',
        _reactComponent: <PlayerInfo_jsx_1.default {...props} stateHelper={base._stateHelper}></PlayerInfo_jsx_1.default>,
    };
    return Object.assign(base, delta);
};
View2D.Chat = (props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'Chat',
        _reactComponent: <Chat_jsx_1.Chat {...props} stateHelper={base._stateHelper}></Chat_jsx_1.Chat>
    };
    return Object.assign(base, delta);
};
View2D.CircleButton = (props) => {
    let base = View2D.create('Component');
    let delta = {
        type: 'CircleButton',
        _reactComponent: <CircleButton_jsx_1.default {...props}></CircleButton_jsx_1.default>,
    };
    return Object.assign(base, delta);
};
View2D.Addons = () => {
    // A modular attachment to a View2D.Component
    let base = View2D.create('');
    const delta = {
        type: 'Addons',
        _parentComponent: null,
        _addons: {},
        setParentComponent: View2D.methods.addonsSetParentComponent(base),
        getAddons: View2D.methods.getAddons(base),
        view2D: View2D.methods.addonsView2D(base)
    };
    return Object.assign(base, delta);
};
View2D.BasicOverlayAddons = () => {
    let base = View2D.create('Addons');
    let events = new EventHandler_js_1.default(document);
    events.defineKeyboardEvent('openChat', ['Enter', 'KeyC', 'KeyT', 'KeyY']);
    events.defineKeyboardEvent('closeChat', ['Escape']);
    let playerLeft = View2D.create('PlayerInfo', {
        team: ChessTeam_js_1.default.WHITE,
        playerName: '--',
        myTurn: true,
        time: -1,
        elo: '----',
        position: 'playerInfoLeft',
        online: true
    });
    let playerRight = View2D.create('PlayerInfo', {
        team: ChessTeam_js_1.default.BLACK,
        playerName: '--',
        myTurn: false,
        time: -1,
        elo: '----',
        position: 'playerInfoRight',
        online: true
    });
    const handleChatMsg = (message) => {
        base._game.getRoomData().send('chatMsg', message);
    };
    const displayChatMsg = (message) => {
        console.log('Displaying:', message);
        let key = message.msg + Date.now();
        let handleHide = () => {
            chat.setState(prevState => ({
                // remove message from showing
                showing: prevState.showing.filter(el => el.key !== key)
            }));
        };
        let chatMsg = (<Chat_jsx_1.ChatMessage key={key} text={message.msg} style={message.style} sender={message.sender} handleHide={handleHide}/>);
        chat.setState(prevState => ({
            messages: prevState.messages.concat([chatMsg]),
            showing: prevState.showing.concat([chatMsg])
        }));
    };
    let chat = View2D.create('Chat', {
        chatOpened: false,
        handleMsg: handleChatMsg,
        messages: [],
        showing: [],
        events: events
    });
    const delta = {
        type: 'BasicOverlayAddons',
        _addons: {
            topbar: [
                playerLeft,
                playerRight
            ],
            rightbar: [
                View2D.create('CircleButton', { icon: home_black_rounded_24dp_svg_1.default, handleClick: View2D.methods.cameraHome(base) }),
                View2D.create('CircleButton', { icon: undo_black_24dp_svg_1.default, handleClick: View2D.methods.undo(base) }),
                View2D.create('CircleButton', { icon: redo_black_24dp_svg_1.default, handleClick: View2D.methods.redo(base) }),
                View2D.create('CircleButton', { icon: chat_black_24dp_svg_1.default, handleClick: View2D.methods.toggleChat(base) })
            ],
            leftbar: [],
            bottombar: [chat],
        },
        _game: null,
        _events: events,
        _chat: chat,
        _playerLeft: playerLeft,
        _playerRight: playerRight,
        setGame: View2D.methods.setGame(base),
        chatMsg: displayChatMsg,
        update: () => {
            // get player data from base._game
            // base._playerLeft.setState()
            const game = base._game;
            let roomData = game.getRoomData();
            let white = roomData.getWhite();
            let black = roomData.getBlack();
            if (white) {
                base._playerLeft.setState({
                    playerName: white._username,
                    time: game.getTimeTeam(ChessTeam_js_1.default.WHITE)
                });
            }
            if (black) { // may be undefined if a user has not joined
                base._playerRight.setState({
                    playerName: black._username,
                    time: game.getTimeTeam(ChessTeam_js_1.default.BLACK)
                });
            }
            if (base._parentComponent) { // if mounted, need to update persistent state.
                base._parentComponent.setAddons(game.view2D());
            }
            // 
        }
    };
    Object.assign(base, delta);
    return base;
};
View2D.create = (type, ...args) => {
    if (View2D[type]) {
        return View2D[type](...args);
    }
    else {
        return new View2D(...args);
    }
};
class Overlay extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            topbar: [],
            leftbar: [],
            rightbar: [],
            bottombar: []
        };
        this.addons = this.state; // persist state between renders
        this.props.stateHelper.onStateChange((state) => {
            this.setState(state, (state) => {
                this.addons = state;
            });
        });
    }
    componentDidMount() {
        console.log('Overlay reappeairng...', this.addons);
        this.setState(this.addons);
    }
    render() {
        return (<div className='overlay'>
                <header className='overlay-topbar'>
                    {this.state.topbar.map(View2D.unwrap)}
                </header>

                <div className='overlay-body'>
                    <div className='overlay-leftbar'>
                        {this.state.leftbar.map(View2D.unwrap)}
                    </div>

                    <div className='overlay-center'>

                    </div>
                </div>
                
                <div className='overlay-rightbar'>
                    {this.state.rightbar.map(View2D.unwrap)}
                </div>

                <footer className='overlay-bottombar'>
                    {this.state.bottombar.map(View2D.unwrap)}
                </footer>
            </div>);
    }
}
exports.default = View2D;
//# sourceMappingURL=View2D.js.map