import React, { Component } from 'react';
import Leaderboard from './Leaderboard.jsx';
import { Button, Container, Row, Col } from 'react-bootstrap';

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
                        <Button size='lg' className='greetingButton' variant='dark'>Play</Button>
                        <Button size='lg' className='greetingButton' variant='outline-dark'>Custom Game</Button>
                    </div>
                    <canvas id='greetingCanvas' className='greetingCanvas'></canvas>
                </div>

                <Leaderboard></Leaderboard>
            </div>
        );
    }
}

export default Home;