class ChessTeam {
	constructor(type) {
		this.type = type;
		this.permissions = new Map();
	}
	
	setPermissions(whitePerms, blackPerms, ghostPerms) {
		this.permissions.set(ChessTeam.WHITE, whitePerms);
		this.permissions.set(ChessTeam.BLACK, blackPerms);
		this.permissions.set(ChessTeam.GHOST, ghostPerms);
	}

	hasPermissions(team) {
		return this.permissions.get(team);
	}

	toJSON() {
		return this.type;
	}
}

ChessTeam.GHOST = new ChessTeam('GHOST');
ChessTeam.NONE = ChessTeam.SPECTATOR = new ChessTeam('NONE'); // TODO: may be problematic since spectator team is NONE and empty piece team is NONE
ChessTeam.WHITE = new ChessTeam('WHITE');
ChessTeam.BLACK = new ChessTeam('BLACK');
ChessTeam.OMNISCIENT = new ChessTeam('OMNISCIENT');
ChessTeam.TIE = ChessTeam.OMNISCIENT;
ChessTeam.ONGOING = ChessTeam.NONE;

ChessTeam.NONE.setPermissions(false, false, false);
ChessTeam.GHOST.setPermissions(false, false, true);
ChessTeam.WHITE.setPermissions(true, false, false);
ChessTeam.BLACK.setPermissions(false, true, false);
ChessTeam.OMNISCIENT.setPermissions(true, true, false);

ChessTeam.oppositeTeam = (team) => {
	if (team === ChessTeam.WHITE) {
		return ChessTeam.BLACK;
	} else if (team === ChessTeam.BLACK) {
		return ChessTeam.WHITE;
	} else {
		return null;
	}
};

ChessTeam.revive = (team) => {
    return ChessTeam[team];
};

export default ChessTeam;