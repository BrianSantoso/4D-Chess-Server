import GameManager from '../../public/js/GameManager.js';
import Move from '../../public/js/Move.js';
import { MoveData } from '../../public/js/MoveHistory.js';

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
            room.onMessage('submitMove', (client, move) => {
                move = Move.revive(move); // TODO: WARNING: client can crash server if sending a moveData with wrong fields: '... is undefined'
                // let moveData = this.makeMove(move);
                // TODO: move broadcast inside of Player?
                try {
                    let authorizedMoveData = this.makeMove(move);
                    // TODO: move broadcast inside of Player?
                    room.broadcast('makeMove', authorizedMoveData, { except: client });
                    client.send('syncMoveData', authorizedMoveData);
                    // TODO: resynchronize client
                } catch {
                    // TODO: don't just catch any error. catch illegal move error. 
                    // (don't want to accuse someone of cheating if the error is internal)
                    console.log('Invalid move.')
                }
            })
		});
		game.setNeedsValidation(true);
		return game;
	}
}

export default ServerGameManager;