"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_dom_1 = tslib_1.__importDefault(require("react-dom"));
const react_router_dom_1 = require("react-router-dom");
const ClientGameManager_js_1 = require("./ClientGameManager.js");
const View2D_js_1 = tslib_1.__importDefault(require("./View2D.js"));
const Authenticator_js_1 = tslib_1.__importDefault(require("./Authenticator.js"));
const FocusState_js_1 = tslib_1.__importDefault(require("./FocusState.js"));
const GameSelect_jsx_1 = tslib_1.__importDefault(require("./components/GameSelect.jsx"));
const Leaderboard_jsx_1 = tslib_1.__importDefault(require("./components/Leaderboard.jsx"));
class AppStateManager {
    constructor(initialState) {
        this.history = [initialState];
    }
    setState(props) {
        const newState = Object.assign(Object.assign({}, this.getState()), props);
        this.history.push(newState);
        return newState;
    }
    getState() {
        return Object.assign({}, this.history[this.history.length - 1]);
    }
}
class App extends react_1.Component {
    constructor(props) {
        super(props);
        // this.appState = new AppStateManager({
        //     greeting: true,
        //     gameSelect: false,
        //     focusState: FocusState.MINIMIZED,
        // })
        this.authenticator = new Authenticator_js_1.default();
        console.log('Authenticator:', this.authenticator);
        this.state = {
            loggedIn: false,
            alerter: View2D_js_1.default.create('Alerter', { showing: [] }),
            navbar: View2D_js_1.default.create('ChessNavbar', this.authenticator, { loggedIn: false }),
            game: null // store game as state so that it will be rendered on creation. TODO: not pretty???
        };
        console.log('App', this);
    }
    initGame() {
        // must be called before authenticator.init
        let game = View2D_js_1.default.create('Game', new ClientGameManager_js_1.ClientGameManager(this.authenticator), {
            focusState: FocusState_js_1.default.CLOSED
        }); // TODO: only initialize clientgamemanager when requested;
        this.setState({
            game: game
        });
        console.log('Game', game);
    }
    componentDidMount() {
        // this.initGame();
        this.initGame();
        this.authenticator.subscribe({
            onAccountChange: (authToken) => {
                if (authToken) {
                    const decoded = Authenticator_js_1.default.decode(authToken);
                    this.state.alerter.alert({
                        variant: 'success',
                        content: `Logged in as ${decoded.username}`
                    });
                }
                else {
                    this.state.alerter.alert({
                        variant: 'success',
                        content: `Logged out!`
                    });
                }
            }
        });
        this.authenticator.init();
    }
    render() {
        return (<>
                
                {View2D_js_1.default.unwrap(this.state.navbar)}
                {View2D_js_1.default.unwrap(this.state.alerter)}
                <react_router_dom_1.HashRouter>
                    <react_router_dom_1.Route path="/home">
                        <OnEnter f={() => {
            this.state.game.setFocus(FocusState_js_1.default.MINIMIZED);
        }}></OnEnter>
                        <GameSelect_jsx_1.default></GameSelect_jsx_1.default>
                        <Leaderboard_jsx_1.default></Leaderboard_jsx_1.default>
                    </react_router_dom_1.Route>
                    {this.state.game ? View2D_js_1.default.unwrap(this.state.game) : ''}
                    <react_router_dom_1.Route path="/play">
                        <OnEnter f={() => {
            this.state.game.setFocus(FocusState_js_1.default.GAMING);
        }}></OnEnter>
                    </react_router_dom_1.Route>
                </react_router_dom_1.HashRouter>
            </>);
    }
}
App.main = function () {
    react_dom_1.default.render(<App></App>, document.getElementById('site-root'));
};
class OnEnter extends react_1.Component {
    componentDidMount() {
        this.props.f();
    }
    render() {
        return '';
    }
}
class OnExit extends react_1.Component {
    componentWillUnmount() {
        this.props.f();
    }
    render() {
        return '';
    }
}
class F extends react_1.Component {
    componentDidMount() {
        this.props.onEnter();
    }
    componentWillUnmount() {
        this.props.f();
    }
    render() {
        return '';
    }
}
exports.default = App;
//# sourceMappingURL=App2.js.map