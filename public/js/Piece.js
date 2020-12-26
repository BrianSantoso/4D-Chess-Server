import ChessTeam from "./ChessTeam.js";
import rayCastParams from './rayCastParams.json';

class Piece {
	constructor(team=ChessTeam.NONE, type='Empty') {
		this.team = team;

		this.hasMoved = false;
		this.type = type;
		this.x = -1;
		this.y = -1;
		this.z = -1;
		this.w = -1;
	}
	
	set(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	assignId(id) {
		this.id = id;
	}
	
	update() {
		this.hasMoved = true;
	}
	
	movement() {
		return null;
	}
	
	attackRayCastParams() {
		return rayCastParams[this._paramKey()]['attack'];
	}
	
	rayCastParams() {
		return rayCastParams[this._paramKey()]['behavior'];
	}
	
	oppositeTeam(otherPiece) {
		if (this.team === ChessTeam.WHITE) {
			return otherPiece.team === ChessTeam.BLACK;
		} else if (this.team === ChessTeam.BLACK) {
			return otherPiece.team === ChessTeam.WHITE;
		} else {
			return false;
		}
	}
	
	sameTeam(otherPiece) {
		return this.team == otherPiece.team;
	}
	
	isEmpty() {
		return this.team == ChessTeam.NONE;
	}

	_paramKey() {
		return this.type;
	}
}

Piece.revive = (fields) => {
	if (!fields) {
		return null;
	}
	let piece = new Piece[fields.type]();
	return Object.assign(piece, fields, {
		team: ChessTeam.revive(fields.team)
	});
};

class Pawn extends Piece {
	constructor(team) {
		super(team, 'Pawn');
	}

	_paramKey() {
		let moved = this.hasMoved ? 'Moved' : 'Unmoved'; 
		let team = this.team.type;
		return this.type + moved + team;
	}
}

class King extends Piece {
	constructor(team) {
		super(team, 'King');
	}
}

class Queen extends Piece {
	constructor(team) {
		super(team, 'Queen');
	}
}

class Bishop extends Piece {
	constructor(team) {
		super(team, 'Bishop');
	}
}

class Knight extends Piece {
	constructor(team) {
		super(team, 'Knight');
	}
}

class Rook extends Piece {
	constructor(team) {
		super(team, 'Rook');
	}
}

Piece.Pawn = Pawn;
Piece.Rook = Rook;
Piece.Knight = Knight;
Piece.Bishop = Bishop;
Piece.King = King;
Piece.Queen = Queen;
Piece.Empty = Piece;

export default Piece;
export { Pawn, Rook, Knight, Bishop, King, Queen };