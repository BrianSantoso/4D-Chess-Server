import PlayerData from './PlayerData.js';

class RoomData {

    // Contains data to synced
    // TODO: use Colyseus Schema for automatic synchronization!
    // - Con: Would need an asymmetric implementation of decrementing player time for local multiplayer :< 

    constructor(room) {
        this._room = room; // Colyseus room

        this._users = {}; // Map id to PlayerData
        this._whiteId;
        this._blackId;
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

    setRoom() {
        this._room = room;
    }

    room() {
        return this._room;
    }
}

RoomData.revive = (fields) => {
    let roomData = new RoomData();

    let users = {};
    for (let prop of fields._users) {
        users[prop] = PlayerData.revive(fields._users[props]);
    }
    
    return Object.assign(roomData, fields, {
        _users: users
    });
};