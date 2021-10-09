"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractReceiver {
    constructor(team, game, player) {
        this._team = team;
        this._game = game;
        this._player = player;
    }
    update() {
    }
    unselect() {
    }
    needsRayCaster() {
        return false;
    }
    setRayCaster(rayCaster) {
    }
    needsClickEvent() {
        return false;
    }
    intentionalClick(event) {
    }
}
exports.AbstractReceiver = AbstractReceiver;
//# sourceMappingURL=Receiver.js.map