"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_dom_1 = tslib_1.__importDefault(require("react-dom"));
const react_router_dom_1 = require("react-router-dom");
const ClientGameManager_js_1 = require("./ClientGameManager.js");
const Register_jsx_1 = tslib_1.__importDefault(require("./components/Register.jsx"));
const Login_jsx_1 = tslib_1.__importDefault(require("./components/Login.jsx"));
const Popup_jsx_1 = tslib_1.__importDefault(require("./components/Popup.jsx"));
const Logout_jsx_1 = tslib_1.__importDefault(require("./components/Logout.jsx"));
const Play_jsx_1 = tslib_1.__importDefault(require("./components/Play.jsx"));
const Navbar_jsx_1 = tslib_1.__importDefault(require("./components/Navbar.jsx"));
const Home_jsx_1 = tslib_1.__importDefault(require("./components/Home.jsx"));
const react_bootstrap_1 = require("react-bootstrap");
const history_1 = require("history");
const Colyseus = tslib_1.__importStar(require("colyseus.js"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
class App extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            focus: 'uninitialized',
            loggedIn: false,
            alert: ''
        };
        this.client = new Colyseus.Client("ws://localhost:3000");
        this.gameManager = new ClientGameManager_js_1.ClientGameManager(this.client);
        this.embed = react_1.default.createRef();
        this.history = history_1.createBrowserHistory();
        this.loseGameFocus = this.loseGameFocus.bind(this);
        this.gainGameFocus = this.gainGameFocus.bind(this);
        this.onAuthSuccess = this.onAuthSuccess.bind(this);
        this.handleCloseAlert = this.handleCloseAlert.bind(this);
        this.onMinimize = this.onMinimize.bind(this);
        this.onMaximize = this.onMaximize.bind(this);
        this.logout = this.logout.bind(this);
        this.alert = this.alert.bind(this);
        console.log(this.history);
        // history.goBack
    }
    componentDidMount() {
        // Must only be run once component is mounted
        // since we need to update state {loggedIn: }
        this.initAuthToken();
    }
    loseGameFocus() {
        this.setState({ focus: 'popup' });
    }
    gainGameFocus() {
        this.setState({ focus: 'focused' });
    }
    handleCloseAlert() {
        this.setState({ alert: '' });
    }
    onAuthSuccess(response) {
        this.setAuthToken(response.data.token);
    }
    setAuthToken(jwtString) {
        let token = jwtString;
        try {
            let decoded = jsonwebtoken_1.default.decode(token, { complete: true });
            this.gameManager.setAuthToken(token);
            localStorage.setItem('authToken', token);
            console.log('authToken set: (decoded ver=)', decoded);
            const notAGuest = decoded.payload.registered;
            this.setState({
                loggedIn: notAGuest
            });
        }
        catch (_a) {
            console.error('Malformed authToken, logging out');
            this.logout();
        }
    }
    initAuthToken() {
        let token = localStorage.getItem('authToken');
        if (token) {
            console.log('Retrieved Cached authToken:', token);
            this.setAuthToken(token);
            // TODO: tell server to update last login
        }
        else {
            axios_1.default.get('/register/guest').then(response => {
                token = response.data.token;
                console.log('Received guest authToken:', token);
                this.setAuthToken(token);
            }).catch(err => {
                console.log('Failed to retrieve guest authToken', err);
            });
        }
    }
    logout() {
        localStorage.removeItem('authToken');
        this.initAuthToken();
        // TODO: tell gamemanager to rejoin room.
    }
    alert(props) {
        let alert = <react_bootstrap_1.Alert className="alert-banner" variant={props.variant} onClose={this.handleCloseAlert} dismissible> {props.content} </react_bootstrap_1.Alert>;
        this.setState({
            alert: alert
        });
    }
    onMaximize() {
        this.setState({ focus: 'focused' });
    }
    onMinimize() {
        this.setState({ focus: 'minimized' });
    }
    render() {
        let embed = this.state.focus === 'uninitialized' ? '' : <ClientGameManager_js_1.Embed ref={this.embed} gameManager={this.gameManager} focus={this.state.focus} onMount={() => { }}></ClientGameManager_js_1.Embed>;
        return (<react_router_dom_1.HashRouter history={history}>
				<react_router_dom_1.Route exact path="/">
					<react_router_dom_1.Redirect to="/home"/>
				</react_router_dom_1.Route>
				<Navbar_jsx_1.default loggedIn={this.state.loggedIn}/>
				{this.state.alert}
				<react_router_dom_1.Route path="/home">
					<Home_jsx_1.default onMount={() => { }} onUnmount={() => { }}></Home_jsx_1.default>
				</react_router_dom_1.Route>
				<react_router_dom_1.Route path="/play">
					<Play_jsx_1.default onMount={this.onMaximize} onUnmount={this.onMinimize}></Play_jsx_1.default>
				</react_router_dom_1.Route>
				{embed}
				<react_router_dom_1.Route path="/login">
					<Popup_jsx_1.default redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Login_jsx_1.default onSuccess={this.onAuthSuccess} alerter={this.alert}></Login_jsx_1.default>
					</Popup_jsx_1.default>
				</react_router_dom_1.Route>
				<react_router_dom_1.Route path="/register">
					<Popup_jsx_1.default redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Register_jsx_1.default onSuccess={this.onAuthSuccess} alerter={this.alert}></Register_jsx_1.default>
					</Popup_jsx_1.default>
				</react_router_dom_1.Route>
				<react_router_dom_1.Route path="/logout">
					<Popup_jsx_1.default redirect='/' onOpen={this.loseGameFocus} onClose={this.gainGameFocus}>
						<Logout_jsx_1.default onSuccess={this.logout} alerter={this.alert}></Logout_jsx_1.default>
					</Popup_jsx_1.default>
				</react_router_dom_1.Route>
			</react_router_dom_1.HashRouter>);
    }
}
App.main = function () {
    // let app = new App();
    react_dom_1.default.render(<App></App>, document.getElementById('site-root'));
};
exports.default = App;
//# sourceMappingURL=App.js.map