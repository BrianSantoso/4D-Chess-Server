import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from "react-router-dom";
import { ClientGameManager, Embed } from "./ClientGameManager.js";
import View2D from './View2D.js';
import Authenticator from './Authenticator.js';
import FocusState from './FocusState.js';

import ChessNavbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import GameSelect from "./components/GameSelect.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

class AppStateManager {
    constructor(initialState) {
        this.history = [initialState]
    }

    setState(props) {
        const newState = {
            ...this.getState(),
            ...props
        }
        this.history.push(newState)
        return newState
    }

    getState() {
        return {
            ...this.history[this.history.length - 1]
        }
    }
}

class App extends Component {
	constructor(props) {
		super(props);

        // this.appState = new AppStateManager({
        //     greeting: true,
        //     gameSelect: false,
        //     focusState: FocusState.MINIMIZED,
        // })

        this.authenticator = new Authenticator();
        console.log('Authenticator:', this.authenticator)

		this.state = {
			loggedIn: false,
			alerter: View2D.create('Alerter', { showing: [] }),
            navbar: View2D.create('ChessNavbar', this.authenticator, { loggedIn: false }),
            game: null // store game as state so that it will be rendered on creation. TODO: not pretty???
		};

        console.log('App', this);
	}

    initGame() {
        // must be called before authenticator.init
        let game = View2D.create('Game', new ClientGameManager(this.authenticator), {
            focusState: FocusState.CLOSED
        }); // TODO: only initialize clientgamemanager when requested;

        this.setState({
            game: game
        });

        console.log('Game', game)
    }

	componentDidMount() {
        // this.initGame();
        this.initGame();
        this.authenticator.subscribe({
            onAccountChange: (authToken) => {
                if (authToken) {
                    const decoded = Authenticator.decode(authToken);
                    this.state.alerter.alert({
                        variant: 'success',
                        content: `Logged in as ${decoded.username}`
                    });
                } else {
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
        return (
            <>
                {/* <ChessNavbar loggedIn={false} authenticator={this.authenticator}/> */}
                {View2D.unwrap(this.state.navbar)}
                {View2D.unwrap(this.state.alerter)}
                <Router>
                    <Route path="/home">
                        <OnEnter f={() => {
                            this.state.game.setFocus(FocusState.MINIMIZED);
                        }}></OnEnter>
                        <GameSelect></GameSelect>
                        <Leaderboard></Leaderboard>
                    </Route>
                    {this.state.game ? View2D.unwrap(this.state.game) : ''}
                    <Route path="/play">
                        <OnEnter f={() => {
                            this.state.game.setFocus(FocusState.GAMING);
                        }}></OnEnter>
                    </Route>
                </Router>
            </>
        );
	}
}

App.main = function() {
	ReactDOM.render(<App></App>, document.getElementById('site-root'));
}

class OnEnter extends Component {
    componentDidMount() {
        this.props.f();
    }
    render() {
        return '';
    }
}
class OnExit extends Component {
    componentWillUnmount() {
        this.props.f();
    }
    render() {
        return '';
    }
}

class F extends Component {
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

export default App;