import Interactor3D from "./Interactor3D.js"
import { AbstractReceiver } from "./Receiver.js";
import { AbstractTransmitter, OnlineTransmitter, LocalTransmitter } from "./Transmitter.js"

class Player {

	constructor(team, game) {
		this.type = '';
		this._game = game;
		this._team = team;
		this._id = 'AbstractPlayer';
		this._username = '--------'; // TODO: put default playernames in config.json, then also replace in ChessRoom
		this._elo = '--';
		this._time = -1;
		this._canInteract = true; // move to abstractplayer3d

		this._receiver = new AbstractReceiver();
		this._transmitter = new AbstractTransmitter();
	}

	makeMove(move) {
		// Player.makeMove is called from receiver
		this._transmitter.makeMove(move);
	}
	
	update(step, hasBegun, canInteract=true) {
		this._canInteract = canInteract;
		if (hasBegun) {
			this._time -= step * 1000; // convert secs to ms
		}
		// query interactors for moves
		if (this._canInteract) {
			this._receiver.update();
		}
		// console.log(this._team, this._time);
	}

	setData(data) {
		// method to set data received from server.
		this._id = data._id;
		this._username = data._username;
		this._elo = data._elo;
		this._time = data._time;
	}

	toJSON() {
		return {
			_id: this._id,
			_username: this._username,
			_elo: this._elo,
			_time: this._time
		}
	}

	// Player3D Methods
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

Player.AbstractPlayer = (team, game, fields) => {
	return Object.assign(new Player(team, game), fields);
}

Player.AbstractPlayer3D = (team, game, fields) => {
	let player = Player.AbstractPlayer(team, game, fields);
	return Object.assign(player, {
		type: 'AbstractPlayer3D',
		_receiver: new AbstractReceiver(team, game, player),
		_transmitter: new AbstractTransmitter(team, game, player)
	});
}

Player.LocalPlayer3D = (team, game, fields) => {
	let player = Player.AbstractPlayer(team, game, fields);
	return Object.assign(player, {
		type: 'LocalPlayer3D',
		_receiver: new Interactor3D(team, game, player),
		_transmitter: new LocalTransmitter(team, game, player)
	});
}

Player.OnlinePlayer3D = (team, game, fields) => {
	let player = Player.AbstractPlayer(team, game, fields);
	return Object.assign(player, {
		type: 'OnlinePlayer3D',
		_receiver: new Interactor3D(team, game, player),
		_transmitter: new OnlineTransmitter(team, game, player)
	});
}

Player.create = (team, game, type='AbstractPlayer', fields={}) => {
	return Player[type](team, game, fields);
}

// Player.revive = (player, fields) => {
// 	return Object.assign(player, fields);
// }

class AbstractPlayer {
	// A ChessGame controller. Defines what method is used to receive moves
	// (e.g. through a 3D UI, over the the internet, an AI),
	// and how to transmit information after making moves
	
	// Might make more sense to remove ChessPlayer inheritance tree and
	// opt for composition instead... Each ChessPlayer can have a receiver 
	// component that decides how to make moves, and transmitter component
	// on how to make moves
	
	constructor(team, game) {
		this._game = game;
		this._team = team;
		this._id = '';
		this._username = '--------';
		this._elo = '--';
		this._time = -1;
		this._canInteract = true; // move to abstractplayer3d

		this._receiver;
		this._transmitter;
	}

	setData(data) {
		this._id = data._id;
		this._username = data._username;
		this._elo = data._elo;
		this._time = data._time;
	}

	toJSON() {
		return {
			_id: this._id,
			_username: this._username,
			_elo: this._elo,
			_time: this._time
		}
	}
	
	makeMove(move) {
		// Player.makeMove is called from receiver
		this._transmitter.makeMove(move);
	}
	
	update(step, hasBegun, canInteract=true) {
		this._canInteract = canInteract;
		if (hasBegun) {
			this._time -= step * 1000; // convert secs to ms
		}
		// query interactors for moves
		if (this._canInteract) {
			this._receiver.update();
		}
		// console.log(this._team, this._time);
	}
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
		this._transmitter = new LocalTransmitter(team, game, this);
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
	constructor(team, game) {
		super(team, game);
		this._receiver = new AbstractReceiver3D(team, game, this);
		this._transmitter = new AbstractTransmitter(team, game, this);
	}
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

export { Player, AbstractPlayer, DummyPlayer, AbstractPlayer3D, LocalPlayer3D, OnlinePlayer3D, Spectator3D };