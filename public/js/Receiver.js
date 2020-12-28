class AbstractReceiver {
    constructor(team, game, player) {
        this._team = team;
		this._game = game;
		this._player = player;
    }
    update() {

    }
}

class AbstractReceiver3D extends AbstractReceiver {
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

export { AbstractReceiver3D };