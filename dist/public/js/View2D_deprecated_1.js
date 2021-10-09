"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_transition_group_1 = require("react-transition-group");
const react_focus_lock_1 = tslib_1.__importDefault(require("react-focus-lock"));
const king_white_svg_1 = tslib_1.__importDefault(require("../assets/player/king_white.svg"));
const king_black_svg_1 = tslib_1.__importDefault(require("../assets/player/king_black.svg"));
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
const EventHandler_js_1 = tslib_1.__importDefault(require("./EventHandler.js"));
const home_black_rounded_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/home-black-rounded-24dp.svg"));
const undo_black_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/undo-black-24dp.svg"));
const redo_black_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/redo-black-24dp.svg"));
const chat_black_24dp_svg_1 = tslib_1.__importDefault(require("../assets/icons/chat-black-24dp.svg"));
const online_svg_1 = tslib_1.__importDefault(require("../assets/player/online.svg"));
const offline_svg_1 = tslib_1.__importDefault(require("../assets/player/offline.svg"));
const config_json_1 = tslib_1.__importDefault(require("./config.json"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
class View2D {
    constructor(gameManager, client) {
        this._gameManager = gameManager;
        this.cameraHome = this.cameraHome.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.root = react_1.default.createRef();
        this._events = new EventHandler_js_1.default(document);
        this._events.defineKeyboardEvent('openChat', ['Enter', 'KeyC', 'KeyT', 'KeyY']);
        this._events.defineKeyboardEvent('closeChat', ['Escape']);
        this._events.defineKeyboardEvent('debugExport', ['KeyE']);
        this._events.defineKeyboardEvent('debugLoad', ['KeyL']);
        this._events.subscribe(gameManager, 'debugExport');
        this._events.subscribe(gameManager, 'debugLoad');
        this._room = null;
        this._client = client;
        this._stateHelper = {
            setStateHandler: (state) => { },
            onStateChange: function (callback) {
                this.setStateHandler = callback;
            },
            setState: function (state) {
                this.setStateHandler(state);
            }
        };
    }
    setPlayerData(playerData, clientTeam) {
        // console.log('[View2D] playerData:', playerData, clientTeam)
        let whiteSide, blackSide;
        if (clientTeam === ChessTeam_js_1.default.BLACK) {
            whiteSide = 'playerInfoRight';
            blackSide = 'playerInfoLeft';
        }
        else {
            // spectators will have white on left
            whiteSide = 'playerInfoLeft';
            blackSide = 'playerInfoRight';
        }
        let white = playerData._white;
        let black = playerData._black;
        let whiteConnected = false;
        let blackConnected = false;
        if (playerData._connectedUsers) {
            let connectedUsers = playerData._connectedUsers.map(user => user._id);
            whiteConnected = connectedUsers.indexOf(white._id) >= 0;
            blackConnected = connectedUsers.indexOf(black._id) >= 0;
        }
        let left = <PlayerInfo team={ChessTeam_js_1.default.WHITE} playerName={white._username} myTurn={true} time={white._time} elo={white._elo} position={whiteSide} online={whiteConnected}></PlayerInfo>;
        let right = <PlayerInfo team={ChessTeam_js_1.default.BLACK} playerName={black._username} myTurn={true} time={black._time} elo={black._elo} position={blackSide} online={blackConnected}></PlayerInfo>;
        this.setState({
            playerLeft: left,
            playerRight: right,
            whiteConnected: whiteConnected,
            blackConnected: blackConnected
        });
    }
    showGameOverWindow() {
        this.setState({
            showGameOverWindow: true
        });
    }
    setBannerMessage(message) {
        this.setState({
            bannerMessage: message
        });
    }
    setFocus(focus) {
        this._focus = focus;
        console.log('View2D focus:', this._focus);
        this._events.setFocus(focus);
        this.setState({
            focus: focus
        });
    }
    addMsg(message) {
        // TODO: don't use refs. Consider moving messages list to View2D instead of Overlay.
        this.root.current.addMsg(message);
    }
    setRoom(room) {
        this._room = room;
        this.setState({
            room: room
        });
    }
    setState(state) {
        this._stateHelper.setState(state);
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
    overlay() {
        return (<Overlay ref={this.root} room={this._room} client={this._client} cameraHome={this.cameraHome} undo={this.undo} redo={this.redo} events={this._events} stateHelper={this._stateHelper}/>);
    }
}
class GameOverWindow extends react_1.Component {
    render() {
        return (<div className='popup' onClick={(e) => e.stopPropagation()}>
				<form className="form" onSubmit={this._handleSubmit}>
					<div className='form-header'>{this.props.message}</div>
					<button className='form-input form-submit' type="submit">Rematch</button>
					<button className='form-input form-submit' type="submit">New Game</button>
					<react_router_dom_1.Link to="/login">Login</react_router_dom_1.Link> to save your progress!
				</form>
			</div>);
    }
}
class Overlay extends react_1.Component {
    constructor(props) {
        super(props);
        // this.messages = [];
        this.state = {
            playerLeft: <PlayerInfo team={ChessTeam_js_1.default.WHITE} playerName={'-------'} myTurn={true} time={null} elo={'--'} position={'playerInfoLeft'} online={false}></PlayerInfo>,
            playerRight: <PlayerInfo team={ChessTeam_js_1.default.BLACK} playerName={'-------'} myTurn={false} time={null} elo={'--'} position={'playerInfoRight'} online={false}></PlayerInfo>,
            bannerMessage: '',
            whiteConnected: false,
            blackConnected: false,
            room: this.props.room,
            messages: [],
            showing: [],
            chatOpened: false,
            showGameOverWindow: false,
            focus: 'focused' // TODO: this is hack to get around initial render
        };
        this.addMsg = this.addMsg.bind(this);
        this.toggleChat = this.toggleChat.bind(this);
        this.openChat = this.openChat.bind(this);
        this.closeChat = this.closeChat.bind(this);
        this.props.stateHelper.onStateChange((state) => { this.setState(state); });
    }
    render() {
        let bannerMessage;
        if (this.state.whiteConnected && this.state.blackConnected) {
            bannerMessage = this.state.bannerMessage;
        }
        else {
            bannerMessage = config_json_1.default.banner.noOpponent;
        }
        let minimized = this.state.focus === 'minimized';
        return (minimized ? <react_bootstrap_1.Nav.Link className='overlay clickable' href="#/play"></react_bootstrap_1.Nav.Link> :
            <div className='overlay'>
				{this.state.showGameOverWindow ? <GameOverWindow message={bannerMessage}></GameOverWindow> : ''}
				{this.state.playerLeft}
				<StatusBanner message={bannerMessage}></StatusBanner>
				{this.state.playerRight}
				
				<div className='sidebar'>
					<CircleButton icon={home_black_rounded_24dp_svg_1.default} handleClick={this.props.cameraHome}></CircleButton>
					<CircleButton icon={undo_black_24dp_svg_1.default} handleClick={this.props.undo}></CircleButton>
					<CircleButton icon={redo_black_24dp_svg_1.default} handleClick={this.props.redo}></CircleButton>
					<CircleButton icon={chat_black_24dp_svg_1.default} handleClick={this.toggleChat}></CircleButton>
				</div>

				<Chat room={this.state.room} client={this.props.client} chatOpened={this.state.chatOpened} handleMsg={this.addMsg} handleOpenChat={this.openChat} handleCloseChat={this.closeChat} messages={this.state.messages} showing={this.state.showing} events={this.props.events}/>
			</div>);
    }
    addMsg(config) {
        // TODO: generate uuid for key
        let key = config.msg + Date.now();
        let handleHide = this._getHideMsgHandler(key);
        let chatMsg = (<ChatMessage key={key} text={config.msg} style={config.style} sender={config.sender} handleHide={handleHide}/>);
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
                // remove message from showing
                showing: prevState.showing.filter(el => el.key !== key)
            }));
        };
    }
    componentDidMount() {
        setTimeout(this.test.bind(this), 1000);
    }
    componentWillUnmount() {
    }
    test() {
        // this.addMsg({
        // 	msg: '[Guest8449947756] good luck have fun!'
        // });
        // this.addMsg({
        // 	msg: '[AnonymousCow] Thanks, you too'
        // });
        // this.addMsg({
        // 	msg: 'AnonPig has joined the room',
        // 	style: {
        // 		color: 'rgb(255, 251, 13)'
        // 	}
        // });
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
class PlayerInfo extends react_1.Component {
    constructor(props) {
        super(props);
    }
    msToHMS(duration) {
        if (typeof duration !== 'number') {
            return '--:--';
        }
        duration = Math.max(0, duration);
        // https://stackoverflow.com/a/54821863
        // let milliseconds = parseInt((duration % 1000) / 100),
        let milliseconds = parseInt((duration % 1000)), seconds = parseInt((duration / 1000) % 60), minutes = parseInt((duration / (1000 * 60)) % 60), hours = parseInt((duration / (1000 * 60 * 60)) % 24);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        if (duration < 60000) {
            let paddingValue = '0';
            let msString = (milliseconds + paddingValue).slice(0, paddingValue.length);
            return seconds + "." + msString;
        }
        else {
            return minutes + ":" + seconds;
        }
    }
    render() {
        let className = 'playerInfo ' + this.props.position;
        let isWhite = this.props.team === ChessTeam_js_1.default.WHITE;
        let playerTime = <div className='playerTime'>{this.msToHMS(this.props.time)}</div>;
        let playerStatus = <img className='playerStatus' src={this.props.online ? online_svg_1.default : offline_svg_1.default}/>;
        let playerIcon = <img className='playerIcon' src={isWhite ? king_white_svg_1.default : king_black_svg_1.default}/>;
        let elo = `(${this.props.elo})`;
        let footer = (<div className='playerFooter'>
				{elo}
				{playerStatus}
				{playerTime}
			</div>);
        return (<div className={className}>
				{playerIcon}
				<div className='playerText'>
					<div className='playerName'>
						{this.props.playerName}
					</div>
					{footer}
				</div>
			</div>);
    }
}
class StatusBanner extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            frame: 0
        };
        this.tick = this.tick.bind(this);
    }
    tick() {
        this.setState(prevState => ({
            frame: (prevState.frame + 1) % this.props.message.length
        }));
    }
    currMessage() {
        if (typeof this.props.message === 'string') {
            return this.props.message;
        }
        else {
            return this.props.message[this.state.frame];
        }
    }
    componentDidMount() {
        this.timerID = setInterval(this.tick, config_json_1.default.banner.msPerMsg);
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    render() {
        return (<div className='statusBanner'>
				{this.currMessage()}
			</div>);
    }
}
class CircleButton extends react_1.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<a className='game-button' onClick={this.props.handleClick}>
				<img src={this.props.icon}/>
			</a>);
    }
}
class Chat extends react_1.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<div className='chat'>
				{this.props.chatOpened ?
            <ChatOpened room={this.props.room} client={this.props.client} handleCloseChat={this.props.handleCloseChat} handleMsg={this.props.handleMsg} messages={this.props.messages} events={this.props.events}></ChatOpened>
            :
                <ChatClosed handleOpenChat={this.props.handleOpenChat} showing={this.props.showing} events={this.props.events}></ChatClosed>}
			</div>);
    }
}
class ChatClosed extends react_1.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<react_transition_group_1.CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
				{this.props.showing}
			</react_transition_group_1.CSSTransitionGroup>);
    }
    componentDidMount() {
        this.props.events.subscribe(this, 'openChat');
    }
    componentWillUnmount() {
        this.props.events.unsubscribe(this, 'openChat');
    }
    openChat(event) {
        event.preventDefault();
        console.log(event);
        this.props.handleOpenChat();
    }
}
class ChatOpened extends react_1.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<div className=''>
				<react_transition_group_1.CSSTransitionGroup transitionName='fade' transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{this.props.messages}
				</react_transition_group_1.CSSTransitionGroup>
				<ChatInput room={this.props.room} client={this.props.client} handleCloseChat={this.props.handleCloseChat} handleMsg={this.props.handleMsg}></ChatInput>
			</div>);
    }
    componentDidMount() {
        this.props.events.subscribe(this, 'closeChat');
    }
    componentWillUnmount() {
        this.props.events.unsubscribe(this, 'closeChat');
    }
    closeChat(event) {
        event.preventDefault();
        console.log(event);
        this.props.handleCloseChat();
    }
}
class ChatMessage extends react_1.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        setTimeout(this.props.handleHide, 4000);
    }
    render() {
        let senderStr = this.props.sender ? `[${this.props.sender}] ` : '';
        return (<div className='chat-message'>
				<span style={this.props.style}> {senderStr + this.props.text} </span>
			</div>);
    }
}
class ChatInput extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this._handleChange = this._handleChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }
    render() {
        return (<react_focus_lock_1.default>
				<form onSubmit={this._handleSubmit}>
					<input className='chat-message' type="text" value={this.state.value} onChange={this._handleChange} maxLength={config_json_1.default.chat.maxLength} autoFocus={true}></input>
				</form>
			</react_focus_lock_1.default>);
    }
    _handleChange(event) {
        this.setState({ value: event.target.value });
    }
    _handleSubmit(event) {
        event.preventDefault();
        let text = this.state.value;
        // TODO: sanitize input if not already handled natively by react
        if (text) {
            console.log('text:', text);
            let message = {
                msg: text,
                sender: this.props.client // This field is only necessary for local games. Is overwritten by server if online
            };
            if (this.props.room) {
                this.props.room.send('chatMsg', message);
            }
            else {
                this.props.handleMsg(message);
            }
            this._clear();
        }
        else {
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
exports.default = View2D;
//# sourceMappingURL=View2D_deprecated_1.js.map