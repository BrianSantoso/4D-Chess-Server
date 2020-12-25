import ChessGame from "./ChessGame.js";
import ChessTeam from "./ChessTeam.js";

class GameManager {
	constructor() {
		
	}

	createAndSetGame(options) {
		let chessGame = this.createGame(options);
		this.setGame(chessGame);
		return chessGame;
	}
	
	setGame(game) {
		this._game = game;
	}
	
	createGame(options) {
		return ChessGame.create(options);
		// TODO: set controllers and subscriptions, etc.
	}

	makeMove(move) {
		this._game.makeMove(move);
	}

	undo() {
		this._game.undo();
	}

	redo() {
		this._game.redo();
	}
}

export default GameManager;