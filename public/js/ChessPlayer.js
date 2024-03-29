import Interactor3D from "./Interactor3D.js"
import { OnlineTransmitter } from "./Transmitter.js"

class AbstractPlayer {
	// A ChessGame controller. Defines what method is used to receive moves
	// (e.g. through a 3D UI, over the the internet, an AI),
	// and how to transmit information after making moves
	
	// Might make more sense to remove ChessPlayer inheritance tree and
	// opt for composition instead... Each ChessPlayer can have a receiver 
	// component that decides how to make moves, and transmitter component
	// on how to make moves
	
	constructor(team, game) {
		// <PlayerInfo 
		// 	team={ChessTeam.WHITE} 
		// 	playerName={'You'} 
		// 	myTurn={true} 
		// 	time={-1} 
		// 	elo={2100} 
		// 	position={'playerInfoLeft'}>
		// </PlayerInfo>
		this._game = game;
		this._team = team;
		this._name = '???';
		this._elo = -1;
		this._time = -1;
		this._canInteract = true;

		this._receiver;
		this._transmitter;
	}
	
	makeMove(move) {
		// Player.makeMove is called from receiver
		
		this._transmitter.makeMove(move);
	}
	
	update(step, canInteract) {
		this._canInteract = canInteract;
		this._time -= step;
		// query interactors for moves
		if (this._canInteract) {
			this._receiver.update();
		}

		// console.log(this._team, this._time);
	}
	
	// setBoardGraphics(boardGraphics) {
	// 	this._boardGraphics = boardGraphics;
	// }
}

class DummyPlayer extends AbstractPlayer {

	// Player with no receiver or transmitter

	makeMove(move) {

	}
	
	update() {

	}
}

class AbstractPlayer3D extends AbstractPlayer {
	
	// It might be better design to pass a direct reference to the chessGame's
	// boardGraphics to the ChessPlayer, but the assumption that the chessGame
	// has a BoardGraphics3D is a compromise I am willing to make for simplicity.
	constructor(team, game) {
		super(team, game);
	}

	unselect() {
		this._receiver.unselect();
	}
	
	setRayCaster(rayCaster) {
		this._receiver.setRayCaster(rayCaster);
	}
	
	needsRayCaster() {
		return this._receiver.needsRayCaster();
	}
	
	needsClickEvent() {
		return this._receiver.needsClickEvent();
	}
	
	intentionalClick(event) {
		if (this._canInteract) {
			this._receiver.intentionalClick(event);
		}
	}
}

class LocalPlayer3D extends AbstractPlayer3D {
	constructor(team, game) {
		super(team, game);
		this._receiver = new Interactor3D(team, game, this);
		this._transmitter = new Transmitter(team, game, this);
	}
}

class OnlinePlayer3D extends AbstractPlayer3D {
	constructor(team, game) {
		super(team, game);
		this._receiver = new Interactor3D(team, game, this);
		this._transmitter = new OnlineTransmitter(team, game, this);
	}
}

class Spectator3D extends AbstractPlayer3D {
	unselect() {

	}
	
	setRayCaster(rayCaster) {
		
	}
	
	needsRayCaster() {
		return false;
	}
	
	needsClickEvent() {
		return false;
	}
	
	intentionalClick(event) {

	}
}

class AIPlayer extends AbstractPlayer {
	
}

export { AbstractPlayer, DummyPlayer, AbstractPlayer3D, LocalPlayer3D, OnlinePlayer3D, Spectator3D };