"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Interactor3D_js_1 = tslib_1.__importDefault(require("./Interactor3D.js"));
const Receiver_js_1 = require("./Receiver.js");
const Transmitter_js_1 = require("./Transmitter.js");
class Player {
    constructor(team, game) {
        this.type = 'AbstractPlayer';
        this._game = game;
        this._team = team;
        this._id = '';
        this._username = '--------'; // TODO: put default playernames in config.json, then also replace in ChessRoom
        this._elo = '--';
        this._time = -1;
        this._canInteract = true; // move to abstractplayer3d
        this._receiver = new Receiver_js_1.AbstractReceiver();
        this._transmitter = new Transmitter_js_1.AbstractTransmitter();
    }
    getTime() {
        return this._time;
    }
    to(type) {
        if (this.type != type) {
            let delta = Player[type]();
            delta._receiver = new delta._receiver(this._team, this._game, this);
            delta._transmitter = new delta._transmitter(this._team, this._game, this);
            Object.assign(this, delta);
        }
        return this;
    }
    makeMove(move) {
        // Player.makeMove is called from receiver
        this._transmitter.makeMove(move);
    }
    update(timeOfLastMove, timestampOfLastMove, hasBegun, canInteract = true) {
        this._canInteract = canInteract;
        if (hasBegun) {
            let msSince = new Date() - timestampOfLastMove;
            this._time = timeOfLastMove - msSince;
            // console.log(timestampOfLastMove, timeOfLastMove, msSince)
            // this._time -= step * 1000; // convert secs to ms
        }
        // query interactors for moves
        if (this._canInteract) {
            this._receiver.update();
        }
        // console.log(this._team, this._time);
    }
    setData(data) {
        // method to set data received from server.
        this._id = data._id;
        this._username = data._username;
        this._elo = data._elo;
        this._time = data._time;
    }
    toJSON() {
        return {
            _id: this._id,
            _username: this._username,
            _elo: this._elo,
            _time: this._time
        };
    }
    // Player3D Methods
    unselect() {
        this._receiver.unselect();
    }
    setRayCaster(rayCaster) {
        this._receiver.setRayCaster(rayCaster);
    }
    needsRayCaster() {
        return this._receiver.needsRayCaster();
    }
    needsClickEvent() {
        return this._receiver.needsClickEvent();
    }
    intentionalClick(event) {
        if (this._canInteract) {
            this._receiver.intentionalClick(event);
        }
    }
}
Player.AbstractPlayer = (team, game, fields) => {
    return {
        type: 'AbstractPlayer',
        _receiver: Receiver_js_1.AbstractReceiver,
        _transmitter: Transmitter_js_1.AbstractTransmitter
    };
};
Player.AbstractPlayer3D = (team, game, fields) => {
    return {
        type: 'AbstractPlayer3D',
        _receiver: Receiver_js_1.AbstractReceiver,
        _transmitter: Transmitter_js_1.AbstractTransmitter
    };
};
Player.LocalPlayer3D = (team, game, fields) => {
    // let player = Player.AbstractPlayer(team, game, fields);
    return {
        type: 'LocalPlayer3D',
        _receiver: Interactor3D_js_1.default,
        _transmitter: Transmitter_js_1.LocalTransmitter
    };
};
Player.OnlinePlayer3D = (team, game, fields) => {
    // let player = Player.AbstractPlayer(team, game, fields);
    return {
        type: 'OnlinePlayer3D',
        _receiver: Interactor3D_js_1.default,
        _transmitter: Transmitter_js_1.OnlineTransmitter
    };
};
Player.create = (team, game, type = 'AbstractPlayer', fields = {}) => {
    let base = new Player(team, game);
    return base.to(type);
    // return Player[type](team, game, fields);
};
exports.default = Player;
//# sourceMappingURL=ChessPlayer.js.map