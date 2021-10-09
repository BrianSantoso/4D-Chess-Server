import React, { Component } from 'react';
import Leaderboard from './Leaderboard.jsx';
import GameSelect from './GameSelect.jsx';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Particles from './Particles.jsx';
import { Link } from 'react-router-dom';

function Home(props) {
    return (
        <div className='entireScreen'>
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
            <GameSelect></GameSelect>
            <Leaderboard></Leaderboard>
        </div>
    );
}

export default Home;