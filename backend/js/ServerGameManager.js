import GameManager from '../../public/js/GameManager.js';

class ServerGameManager extends GameManager {
    constructor() {
        super();
        this.players = [];
        this.spectators = [];
    }

    addUser() {
        
    }
}

export default ServerGameManager;