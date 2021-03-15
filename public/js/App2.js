import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Redirect } from "react-router-dom";
import { ClientGameManager, Embed } from "./ClientGameManager.js";
import View2D from './View2D.js';
import Authenticator from './Authenticator.js';
import FocusState from './FocusState.js';

import ChessNavbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';


class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loggedIn: false,
			alerter: View2D.create('Alerter', { showing: [] }),
            game: null // store game as state so that it will be rendered on creation. TODO: not pretty???
		};

        this.authenticator = new Authenticator();

        console.log('Authenticator:', this.authenticator)
	}

    initGame() {
        // must be called before authenticator.init
        let game = View2D.create('Game', new ClientGameManager(this.authenticator), {
            focusState: FocusState.GAMING
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
                <ChessNavbar loggedIn={false}/>
                {View2D.unwrap(this.state.alerter)}
                <Router>
                    <Route path="/home">
                        <OnEnter f={() => {
                            this.state.game.setFocus(FocusState.MINIMIZED);
                        }}></OnEnter>
                        <Home></Home>
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