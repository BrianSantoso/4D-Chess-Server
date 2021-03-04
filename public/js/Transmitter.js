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
        let moveData = super.makeMove(move);
        console.log('Transmitting move:', moveData)
        this._game.sendMessage('moveData', moveData);
    }
}

export { AbstractTransmitter, LocalTransmitter, OnlineTransmitter };