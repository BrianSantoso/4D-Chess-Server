class AbstractReceiver {
    constructor(team, game, player) {
        this._team = team;
		this._game = game;
		this._player = player;
    }
    update() {

	}
	
	unselect() {

	}
	
	needsRayCaster() {
		return false;
	}

	setRayCaster(rayCaster) {

	}
	
	needsClickEvent() {
		return false;
	}
	
	intentionalClick(event) {

	}
}

export { AbstractReceiver };