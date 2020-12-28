import Interactor3D from "./Interactor3D.js"
import Transmitter, { OnlineTransmitter } from "./Transmitter.js"

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

		this._transmitter;
		this._receiver;
	}
	
	makeMove(move) {
		// this._game.makeMove(move);
		this._transmitter.makeMove(move);
	}
	
	update() {
		// query interactors for moves
		this._receiver.update();
		// TODO: Command objects, send command to server for validation
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
		this._receiver = new Interactor3D(team, chessGame, this);
		this._transmitter = new Transmitter(team, chessGame, this);
	}

	unselect() {
		this._receiver.unselect();
	}
	
	setRayCaster(rayCaster) {
		this._receiver.setRayCaster(rayCaster);
	}
	
	needsRayCaster() {
		return true;
	}
	
	needsClickEvent() {
		return true;
	}
	
	intentionalClick(event) {
		this._receiver.intentionalClick(event);
	}
}

class OnlinePlayer3D extends Player3D {
	constructor(team, chessGame) {
		super(team, chessGame);
		this._transmitter = new OnlineTransmitter(team, chessGame, this);
	}
}

class MoveReceiverTransmitter extends Player3D {
	
}

class AIPlayer extends ChessPlayer {
	
}

export { Player3D, OnlinePlayer3D, MoveReceiverTransmitter }