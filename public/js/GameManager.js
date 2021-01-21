import ChessGame from "./ChessGame.js";
import ChessTeam from "./ChessTeam.js";
import { merge } from "lodash";

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
		console.log("Loading from:", jsonData);
		let template = this.createGame({
			boardConfig: null
		});
		let delta = ChessGame.revive(jsonData);
		// let newGame = Object.assign(template, ChessGame.revive(jsonData));
		// WARNING: If the source has a key whose value is strictly equal to undefined, merge() will not overwrite that key in the destination.
		let newGame = merge(template, delta); // need deep merge so that templated Players receive their fields.
		console.log(template);
		this.setGame(newGame);
		console.log('Loaded game:', newGame);
	}

	toJSON() {
		return JSON.parse(JSON.stringify(this._game));
	}
	
	setGame(game) {
		this._game = game;
		this._game.initBoardGraphics();
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

	setPlayerData(playerData) {
		this._game.setPlayerData(playerData);
	}

	getPlayerData() {
		return this._game.getPlayerData();
	}
}

export default GameManager;