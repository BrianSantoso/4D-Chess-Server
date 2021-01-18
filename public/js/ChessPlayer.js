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

	to(type) {
		let delta = Player[type]();
		delta._receiver = new delta._receiver(this._team, this._game, this);
		delta._transmitter = new delta._transmitter(this._team, this._game, this);
		Object.assign(this, delta);
		// console.log('casted to:', this)
		return this;
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
	return {
		type: 'AbstractPlayer',
		_receiver: AbstractReceiver,
		_transmitter: AbstractTransmitter
	};
}

Player.AbstractPlayer3D = (team, game, fields) => {
	return {
		type: 'AbstractPlayer3D',
		_receiver: AbstractReceiver,
		_transmitter: AbstractTransmitter
	};
}

Player.LocalPlayer3D = (team, game, fields) => {
	// let player = Player.AbstractPlayer(team, game, fields);
	return {
		type: 'LocalPlayer3D',
		_receiver: Interactor3D,
		_transmitter: LocalTransmitter
	};
}

Player.OnlinePlayer3D = (team, game, fields) => {
	// let player = Player.AbstractPlayer(team, game, fields);
	return {
		type: 'OnlinePlayer3D',
		_receiver: Interactor3D,
		_transmitter: OnlineTransmitter
	};
}

Player.create = (team, game, type='AbstractPlayer', fields={}) => {
	let base = new Player(team, game);
	return base.to(type);
	// return Player[type](team, game, fields);
}

export default Player;