"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
function GameSelect({ handleSubmit = () => { } }) {
    const DEFAULT_BOARD = '2 Dimensions';
    const DEFAULT_MODIFIER = 'Classic';
    const DEFAULT_OPPONENT = 'Matchmaking';
    let [board, setBoard] = react_1.useState(DEFAULT_BOARD);
    let [modifier, setModifier] = react_1.useState(DEFAULT_MODIFIER);
    let [opponent, setOpponent] = react_1.useState(DEFAULT_OPPONENT);
    return <div className='entireScreen'>
        <div className='greetingText'>Create a Game</div>
        <div className='center'>
            <react_bootstrap_1.Button onClick={() => handleSubmit(board, modifier, opponent)} size='lg' className='greetingButton' variant='dark'>
            Play</react_bootstrap_1.Button>
        </div>
        <div className='gameSelect'>
            <CardSelect handleSelect={setBoard} selected={board}>
                <GameCard header='2 Dimensions' body='The classic chess board.'></GameCard>
                <GameCard header='3 Dimensions' body='A stack of boards'></GameCard>
                <GameCard header='4 Dimensions' body='Many stacks of boards'></GameCard>
            </CardSelect>
            <CardSelect handleSelect={setModifier} selected={modifier}>
                <GameCard header='Classic' body='Checkmate your opponent to win'></GameCard>
                <GameCard header='Atomic' body='Nearby pieces explode on capture!'></GameCard>
                <GameCard header='Capture Kings' body='Capture all kings to win!'></GameCard>
                <GameCard header='King of the Hill' body='First king in the center wins!'></GameCard>
            </CardSelect>
            <CardSelect handleSelect={setOpponent} selected={opponent}>
                <GameCard header='Matchmaking' body='Play online with a random person'></GameCard>
                <GameCard header='Free Play' body='Your board, your world!'></GameCard>
                <GameCard header='Computer' body='Play against bots of similar elo'></GameCard>
                <GameCard header='Private Game' body='Invite a friend!'></GameCard>
            </CardSelect>
        </div>
    </div>;
}
function CardSelect({ handleSelect = () => { }, selected, children }) {
    return (<div className='cardSelect'>
            {children.map(el => {
        return react_1.default.cloneElement(el, {
            handleClick: handleSelect,
            selected: selected
        });
    })}
        </div>);
}
function GameCard({ icon, header, body, handleClick = () => { }, selected }) {
    const displayState = selected == header ? 'gameCard-selected' : 'gameCard-unselected';
    const DUMMY_ICON = "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTEyIDUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxnPjxnPjxnIGlkPSJYTUxJRF8xOTQ3XyI+PGcgaWQ9IlhNTElEXzE5NDhfIj48ZyBpZD0iWE1MSURfMTk0OV8iPjxnIGlkPSJYTUxJRF8xOTUwXyI+PGcgaWQ9IlhNTElEXzE5NTFfIj48ZyBpZD0iWE1MSURfMTk1Ml8iPjxnIGlkPSJYTUxJRF8xOTUzXyI+PGcgaWQ9IlhNTElEXzE5NTRfIj48ZyBpZD0iWE1MSURfMTk5OV8iPjxnIGlkPSJYTUxJRF8yMDAwXyI+PGcgaWQ9IlhNTElEXzIwMDFfIj48ZyBpZD0iWE1MSURfMjAwMl8iPjxnIGlkPSJYTUxJRF8yMDAzXyI+PGcgaWQ9IlhNTElEXzIwMDRfIj48ZyBpZD0iWE1MSURfMjAwNV8iPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgZmlsbD0iIzQ5NDk0OSIgcj0iMjU2Ii8+PC9nPjwvZz48L2c+PC9nPjwvZz48L2c+PC9nPjwvZz48L2c+PC9nPjwvZz48L2c+PC9nPjwvZz48L2c+PC9nPjwvZz48cGF0aCBkPSJtNTEyIDI1NmMwLTYuODE4LS4yNzMtMTMuNTcxLS43OTYtMjAuMjU0bC0xNTMuMjYtMTUzLjI2Yy0yNS43MTItMjYuODYzLTQ4LjE3OSAzLjk0MS00OC4xNzkgMy45NDFsLTE3LjY4Ni0xNS4zOTgtMjQuNjU0LTI0LjY0NC0xMzIuMDU4IDE0OC4yODMgNjkuNTg4IDY5Ljc3NGMtNC40NzEgNi44NDktNTQuODM0IDE0Ni4wNi01NC44MzQgMTQ2LjA2bC0zNC4xODIgMzUuMjQgNDkuOTE3IDQ5LjkxN2MyOC4wNCAxMC41NTIgNTguNDE0IDE2LjM0MSA5MC4xNDQgMTYuMzQxIDE0MS4zODUgMCAyNTYtMTE0LjYxNSAyNTYtMjU2eiIgZmlsbD0iIzJkMmQyZCIvPjxnPjxwYXRoIGQ9Im0yNzguNDEgNjIuNzk4IDI0Ljg3OS0xNy41OTJzOTEuMTM3IDMyLjc5MSA5My42MzUgMTMyLjA5NGMxLjkzOSA3Ny4wNTktNi4wMDMgMTE2LjA5LTYuMDAzIDExNi4wOWgtNjkuNjAzeiIgZmlsbD0iI2NlZGZlMiIvPjxwYXRoIGQ9Im0yMzguOTgyIDY5LjA1MnMtMTguNTg1IDExLjc2Mi0yOS41ODMgMTUuNTY5LTIyLjQxOCA1LjA3Ni0yOC43NjMgMTkuNDU3Yy02LjM0NSAxNC4zODItMzEuNzkxIDMyLjQ2Mi00Mi43MjIgMzkuMzM4LTE1LjM3MSA5LjY2OS0xOC4xNTQgMzAuNzE5LTkuMjcxIDQzLjgzMSA4Ljg4MyAxMy4xMTMgMjAuMjMzIDE0LjAzMSAzMS4yMTQgMTMuMDE0IDkuNjk2LS44OTggMTguMjU0LTkuODk0IDI3LjEzLTE3LjUwOHMxOS4yMDQtMy44NDQgMzAuMTUzIDEuMjY5YzYuMjcxIDIuOTI4IDExLjcyIDQuNzY4IDI1LjU1IDQuOTg3IDAgMC00NS4zMSA0MS42NzktNjMuOTIxIDgxLjg2My0xOC42MTIgNDAuMTg0LTEzLjc4MyA4Mi4wMDItMTMuNzgzIDgyLjAwMmgxNjQuOTY1cy0yLjk2MS02OC42MDQgMC05MC4xNzdjMi45NjEtMjEuNTcyIDM2LjYxNi05NS40MjUgNy40My0xNDcuMDI5cy01OC45NzEtNTIuODcxLTU4Ljk3MS01Mi44NzEtMTMuNDIxLTMwLjE5Ny0zOS44MjQtMzEuODk3eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Im0zMjkuOTUgMjYyLjdjLTIuOTYgMjEuNTcgMCA5MC4xNyAwIDkwLjE3aC03My45NXYtMzE2LjI0YzE0Ljg4IDkuMjIgMjIuNDEgMjYuMTcgMjIuNDEgMjYuMTdzMjkuNzggMS4yNiA1OC45NyA1Mi44N2MyOS4xOSA1MS42LTQuNDcgMTI1LjQ2LTcuNDMgMTQ3LjAzeiIgZmlsbD0iI2YxZjRmNiIvPjxnPjxwYXRoIGQ9Im0xMzUuODYgMzQ4LjkyNGgyNDAuMjh2NDUuOTM3aC0yNDAuMjh6IiBmaWxsPSIjZGFlYWVjIi8+PHBhdGggZD0ibTI1NiAzNDguOTE5aDEyMC4xMzl2NDUuOTM5aC0xMjAuMTM5eiIgZmlsbD0iI2NlZGZlMiIvPjxwYXRoIGQ9Im0xMTUuOTM4IDM5MC44NDloMjgwLjEyM3Y1NC44OTNoLTI4MC4xMjN6IiBmaWxsPSIjZjFmNGY2Ii8+PGc+PHBhdGggZD0ibTI1NiAzOTAuODQ4aDE0MC4wNjF2NTQuODkxaC0xNDAuMDYxeiIgZmlsbD0iI2RhZWFlYyIvPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=";
    return <react_bootstrap_1.Media className={`gameCard ${displayState}`} onClick={() => handleClick(header)}>
                <img width={64} height={64} className="mr-4" src={icon || DUMMY_ICON} alt="Generic placeholder"/>
                <react_bootstrap_1.Media.Body>
                    <h2>{header}</h2>
                    {body}
                </react_bootstrap_1.Media.Body>
            </react_bootstrap_1.Media>;
}
exports.GameCard = GameCard;
exports.default = GameSelect;
//# sourceMappingURL=GameSelect.js.map