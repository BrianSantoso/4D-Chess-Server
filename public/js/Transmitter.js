class Transmitter {
    constructor(team, game, player) {
        this._team = team;
        this._game = game;
        this._player = player;
    }

    makeMove(move) {
        this._game.makeMove(move);
    }
}

class OnlineTransmitter extends Transmitter {
    constructor(team, game, player) {
        super(team, game, player);
    }

    makeMove(move) {
        super.makeMove(move);
        this._game.sendMessage('move', move);
    }
}

export default Transmitter;
export { OnlineTransmitter };