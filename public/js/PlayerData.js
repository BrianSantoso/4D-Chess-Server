import ChessTeam from './ChessTeam.js';

class PlayerData {
    constructor() {
        this.type;
        this._id;
        this._username;
        this._team;
        this._elo;
    }
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

PlayerData.Spectator = () => {
    let base = PlayerData.create('');
    let delta = {
        type: 'Spectator'
    };

    return Object.assign(base, delta);
}

PlayerData.Player = () => {
    let base = PlayerData.create('');
    let delta = {
        type: 'Player',
        _time: null
    }
}

PlayerData.create = (type, ...args) => {
    if (type) {
        return PlayerData[type](args);
    } else {
        return new PlayerData(args);
    }
}