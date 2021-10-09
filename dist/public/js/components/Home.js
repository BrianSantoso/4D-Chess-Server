"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const Leaderboard_jsx_1 = tslib_1.__importDefault(require("./Leaderboard.jsx"));
const GameSelect_jsx_1 = tslib_1.__importDefault(require("./GameSelect.jsx"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
function Home(props) {
    return (<div className='entireScreen'>
            <div className='greeting'>
                <div className='greetingContent'>
                    <div className='greetingText'>New ways to play Chess</div>
                    <react_router_dom_1.Link to="/play">
                        <react_bootstrap_1.Button size='lg' className='greetingButton' variant='dark'>Play</react_bootstrap_1.Button>
                    </react_router_dom_1.Link>
                    <react_bootstrap_1.Button size='lg' className='greetingButton' variant='outline-dark'>Custom Game</react_bootstrap_1.Button>
                </div>
                
            </div>
            <GameSelect_jsx_1.default></GameSelect_jsx_1.default>
            <Leaderboard_jsx_1.default></Leaderboard_jsx_1.default>
        </div>);
}
exports.default = Home;
//# sourceMappingURL=Home.js.map