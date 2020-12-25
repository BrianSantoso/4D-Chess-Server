import ChessGame from "./ChessGame.js";

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
		// Factory to create game, instantiating and injecting required dependencies
		let game = new ChessGame(options.dim);
		
		let boardGraphics = new options.BoardGraphics(options.dim);
		game.setBoardGraphics(boardGraphics);
		
		let white = new options.WhitePlayer(ChessGame.WHITE, game);
		let black = new options.BlackPlayer(ChessGame.BLACK, game);
		game.setWhite(white);
		game.setBlack(black);
		
		return game;
		// TODO: set controllers and subscriptions, etc.
	}

	undo() {
		this._game.undo();
	}

	redo() {
		this._game.redo();
	}
}

export default GameManager;