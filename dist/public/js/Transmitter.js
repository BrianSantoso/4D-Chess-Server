"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractTransmitter {
    constructor(team, game, player) {
        this._team = team;
        this._game = game;
        this._player = player;
    }
    makeMove(move) {
    }
}
exports.AbstractTransmitter = AbstractTransmitter;
class LocalTransmitter extends AbstractTransmitter {
    makeMove(move) {
        return this._game.makeMove(move);
    }
}
exports.LocalTransmitter = LocalTransmitter;
class OnlineTransmitter extends LocalTransmitter {
    constructor(team, game, player) {
        super(team, game, player);
    }
    makeMove(move) {
        // this._game.simulateMove(move);
        super.makeMove(move);
        console.log('Submitting move:', move);
        this._game.sendMessage('submitMove', move);
    }
}
exports.OnlineTransmitter = OnlineTransmitter;
//# sourceMappingURL=Transmitter.js.map