import React, { Component } from 'react';
import Leaderboard from './Leaderboard.jsx';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Particles from './Particles.jsx';
import { Link } from 'react-router-dom';

class Home extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    render() {
        return (
            <div className='home'>
                <div className='greeting'>
                    <div className='greetingContent'>
                        <div className='greetingText'>New ways to play Chess</div>
                        <Link to="/play">
                            <Button size='lg' className='greetingButton' variant='dark'>Play</Button>
                        </Link>
                        <Button size='lg' className='greetingButton' variant='outline-dark'>Custom Game</Button>
                    </div>
                    {/* <Particles></Particles> */}
                </div>

                <Leaderboard></Leaderboard>
            </div>
        );
    }
}

export default Home;