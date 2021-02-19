import { Plane } from "three";

class PlayerData {
    // bundles of locally cached data from the server
    constructor() {
        this.type;
        this._id;
        this._username;
        this._elo;
    }

    get(field) {
        return this[field];
    }
}

PlayerData.User = (user) => {
    let base = PlayerData.create('');
    let delta = {
        type: 'User',
        _id: user.get('_id'),
        _username: user.username,
        _elo: user.elo
    }
    return Object.assign(base, delta);
}

PlayerData.stripUnauthorizedData = (playerData) => {
    let stripped = Object.assign(new PlayerData(), playerData);
    
    const unauthorizedFields = [
        '_time'
    ];

    unauthorizedFields.forEach(field => {
        delete stripped[field]
    });
    
    return stripped;
}

PlayerData.Player = (...args) => {
    let base = PlayerData.create('', ...args);
    let delta = {
        type: 'Player',
        _time: null
    }
}

PlayerData.create = (type, ...args) => {
    if (type) {
        return PlayerData[type](...args);
    } else {
        return new PlayerData(...args);
    }
}

PlayerData.revive = (fields) => {
    let base = PlayerData.create(fields.type);
    return Object.assign(base, fields);
}

export default PlayerData;