"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
const PlayerData_js_1 = tslib_1.__importDefault(require("./PlayerData.js"));
class RoomData {
    // Contains data/state to synced
    // TODO: use Colyseus Schema for automatic synchronization!
    // - Con: Would need an asymmetric implementation of decrementing player time for local multiplayer :< 
    constructor() {
        this._room; // Colyseus room, client-side only
        this._users = {}; // Map id to PlayerData
        this._whiteId;
        this._blackId;
    }
    send(type, message) {
        this._room.send(type, message);
    }
    playersAssigned() {
        return this._whiteId && this._blackId;
    }
    toJSON() {
        return {
            _users: this._users,
            _whiteId: this._whiteId,
            _blackId: this._blackId,
        };
    }
    setRoom(room) {
        this._room = room;
    }
    getRoom() {
        return this._room;
    }
    getTeam(id) {
        if (this.isWhiteId(id)) {
            return ChessTeam_js_1.default.WHITE;
        }
        if (this.isBlackId(id)) {
            return ChessTeam_js_1.default.BLACK;
        }
        return ChessTeam_js_1.default.SPECTATOR;
    }
    getRole(id) {
        if (this.isWhiteId(id) || this.isBlackId(id)) {
            return 'player';
        }
        return 'spectator';
    }
    isWhiteId(id) {
        return id === this._whiteId;
    }
    isBlackId(id) {
        return id === this._blackId;
    }
    getWhite() {
        return this._users[this._whiteId];
    }
    getBlack() {
        return this._users[this._blackId];
    }
    isConnected(id) {
        return this._users.hasOwnProperty(id);
    }
    addUser(playerData) {
        let id = playerData.get('_id');
        this._users[id] = playerData;
        if (!this.getWhiteId()) {
            this._whiteId = id;
        }
        else if (!this.getBlackId()) {
            this._blackId = id;
        }
    }
    removeUser(id) {
        delete this._users[id];
    }
    setWhiteId(id) {
        this._whiteId = id;
    }
    getWhiteId() {
        return this._whiteId;
    }
    setBlackId(id) {
        this._blackId = id;
    }
    getBlackId() {
        return this._blackId;
    }
    getConnectedUsers() {
        return this._users.values();
    }
}
RoomData.revive = (fields) => {
    let roomData = new RoomData();
    let users = {};
    Object.keys(fields._users).forEach(prop => {
        users[prop] = PlayerData_js_1.default.revive(fields._users[prop]);
    });
    return Object.assign(roomData, fields, {
        _users: users
    });
};
RoomData.stripUnauthorizedData = (roomData) => {
    let stripped = Object.assign(new RoomData(), roomData);
    const unauthorizedFields = [
        '_time'
    ];
    unauthorizedFields.forEach(field => {
        delete stripped[field];
    });
    return stripped;
};
exports.default = RoomData;
//# sourceMappingURL=RoomData.js.map