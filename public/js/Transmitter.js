class AbstractTransmitter {
    constructor(team, game, player) {
        this._team = team;
        this._game = game;
        this._player = player;
    }

    makeMove(move) {
        
    }
}

class LocalTransmitter extends AbstractTransmitter {
    makeMove(move) {
        return this._game.makeMove(move);
    }
}

class OnlineTransmitter extends LocalTransmitter {
    constructor(team, game, player) {
        super(team, game, player);
    }

    makeMove(move) {
        // this._game.simulateMove(move);
        super.makeMove(move);
        console.log('Submitting move:', move)
        this._game.sendMessage('submitMove', move);
    }
}

export { AbstractTransmitter, LocalTransmitter, OnlineTransmitter };