import GameManager from '../../public/js/GameManager.js';

class ServerGameManager extends GameManager {
    // Handle's server-specific peripherals needed to
    // create the server's copy of the game
    createGame(options) {
		let game = super.createGame(options);
        let room = this._room;
		game.setRoom(room, function configureMessageHandlers() {
            // Configure server-side room message handlers
            // 'this' is bound to the game
            room.onMessage('chatMsg', room._chatMsg);
            room.onMessage('move', (client, message) => {
                
                let move = Move.revive(message);
                // TODO: move validation
                try {
                    let moveData = this.makeMove(move);
                    // TODO: move broadcast inside of Player?
                    room.broadcast('move', {
                        move: move,
                        // playerData: this.getPlayerData()
                    }, { except: client });
                } catch {
                    console.log('Invalid move.')
                }
            })
		});
		game.setNeedsValidation(true);
		return game;
	}
}

export default ServerGameManager;