import ChessGame, { deepMerge } from "./ChessGame.js";
import ChessTeam from "./ChessTeam.js";
import RoomData from "./RoomData.js";

class GameManager {
	constructor() {
		this._game;
		this._room;
	}

	setRoom(room) {
		this._room = room;
	}

	createAndSetGame(options) {
		let chessGame = this.createGame(options);
		this.setGame(chessGame);
		return chessGame;
	}

	loadFrom(jsonData) {
		console.log("Loading from:", jsonData);
		let template = this.createGame({
			boardConfig: null
		});
		let delta = ChessGame.revive(jsonData);
		// let newGame = Object.assign(template, ChessGame.revive(jsonData));
		let newGame = deepMerge(template, delta); // need deep merge so that templated Players receive their fields.
		console.log('Template:', template);
		console.log('Delta:', delta)
		this.setGame(newGame);
		console.log('Finished loading game:', newGame);
	}

	toJSON() {
		return JSON.parse(JSON.stringify(this._game));
	}
	
	setGame(game) {
		if (this._game) {
			this._game.setManager(null);
		}
		this._game = game;
		this._game.setManager(this);
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