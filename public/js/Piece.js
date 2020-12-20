import ChessGame from "./ChessGame.js";
import rayCastParams from './rayCastParams.json';

class Piece {
	constructor(team=ChessGame.NONE) {
		this.team = team;

		this.hasMoved = false;
		this.type = '';
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
		if (this.team === ChessGame.WHITE) {
			return otherPiece.team === ChessGame.BLACK;
		} else if (this.team === ChessGame.BLACK) {
			return otherPiece.team === ChessGame.WHITE;
		} else {
			return false;
		}
	}
	
	sameTeam(otherPiece) {
		return this.team == otherPiece.team;
	}
	
	isEmpty() {
		return this.team == ChessGame.NONE;
	}

	_paramKey() {
		return this.type;
	}
}

class Pawn extends Piece {
	constructor(team) {
		super(team);
		this.type = 'pawn';
	}

	_paramKey() {
		let moved = this.hasMoved ? 'Moved' : 'Unmoved'; 
		let team = this.team === ChessGame.WHITE ? 'White' : 'Black';
		return this.type + moved + team;
	}
}

class King extends Piece {
	constructor(team) {
		super(team);
		this.type = 'king';
	}
}

class Queen extends Piece {
	constructor(team) {
		super(team);
		this.type = 'queen';
	}
}

class Bishop extends Piece {
	constructor(team) {
		super(team);
		this.type = 'bishop';
	}
}

class Knight extends Piece {
	constructor(team) {
		super(team);
		this.type = 'knight';
	}
}

class Rook extends Piece {
	constructor(team) {
		super(team);
		this.type = 'rook';
	}
}

export default Piece;
export { Pawn, Rook, Knight, Bishop, King, Queen };