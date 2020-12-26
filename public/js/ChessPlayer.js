import Interactor3D from "./Interactor3D.js"

class ChessPlayer {
	// A ChessGame controller. Defines what method is used to receive moves
	// (e.g. through a 3D UI, over the the internet, an AI),
	// and how to transmit information after making moves
	
	// TODO: Might make more sense to remove ChessPlayer inheritance tree and
	// opt for composition instead... Each ChessPlayer can have an interactor 
	// component that decides how to make moves, and transmitter component?
	
	constructor(team, chessGame) {
		this._team = team;
		this._game = chessGame;
		this._commandQueue = [];
	}
	
	makeMove(move) {
		this._game.makeMove(move);
	}
	
	update() {
		// query interactors for moves
		this._interactor.update();
		let move = this._commandQueue.shift();
		// TODO: Command objects, send command to server for confirmation
		if (move) {
			this.makeMove(move);
		}
	}
	
	setBoardGraphics(boardGraphics) {
		this._boardGraphics = boardGraphics;
	}
	
	needsRayCaster() {
		return false;
	}
	
	needsClickEvent() {
		return false;
	}
}

class Player3D extends ChessPlayer {
	
	// It might be better design to pass a direct reference to the chessGame's
	// boardGraphics to the ChessPlayer, but the assumption that the chessGame
	// has a BoardGraphics3D is a compromise I am willing to make for simplicity.
	constructor(team, chessGame) {
		super(team, chessGame);
		this._interactor = new Interactor3D(team, chessGame, this._commandQueue);
	}

	unselect() {
		this._interactor.unselect();
	}
	
	setRayCaster(rayCaster) {
		this._interactor.setRayCaster(rayCaster);
	}
	
	needsRayCaster() {
		return true;
	}
	
	needsClickEvent() {
		return true;
	}
	
	intentionalClick(event) {
		this._interactor.intentionalClick(event);
	}
}

class OnlinePlayer3D extends Player3D {
	
}

class MoveReceiver extends ChessPlayer /* implements Receiver */ {
	
}

class MoveReceiverTransmitter extends MoveReceiver /* implements Transmitter */ {
	
}

class AIPlayer extends ChessPlayer {
	
}

export { Player3D, MoveReceiverTransmitter }