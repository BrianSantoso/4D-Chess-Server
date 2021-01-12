import ChessGame from "./ChessGame.js";

class GameManager {
	constructor() {
		this._game;
	}

	createAndSetGame(options) {
		let chessGame = this.createGame(options);
		this.setGame(chessGame);
		return chessGame;
	}

	loadFrom(jsonData) {
		let template = this.createGame({});
		let newGame = Object.assign(template, ChessGame.revive(jsonData));
		this.setGame(newGame);
		console.log('Loaded game:', newGame);
	}

	toJSON() {
		return JSON.parse(JSON.stringify(this._game));
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