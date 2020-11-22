import ChessGame from "./ChessGame.js";
import { unique } from "./ArrayUtils.js";
import * as rayCastParams from './rayCastParams.json';
console.log(rayCastParams)
class Piece {
	constructor(team=ChessGame.NONE) {
		this.team = team;
		this.metaData = null;
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
		
	}
	
	movement() {
		return null;
	}
	
	attackRayCastParams() {
		return rayCastParams['default'][this.type]['attack'];
	}
	
	rayCastParams() {
		return rayCastParams['default'][this.type]['behavior'];
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
}

class Pawn extends Piece {
	constructor(team) {
		super(team);
		this.metaData = {
			hasMoved: false,
			justMovedTwoSpaces: false
		};
		this.type = 'pawn';
	}
	
	update() {
		this.metaData.hasMoved = true;
	}
	
	attackRayCastParams() {
		let moved = this.metaData.hasMoved ? 'pawnMoved' : 'pawnUnmoved'; 
		let team = this.team === ChessGame.WHITE ? 'White' : 'Black';
		let lookup = moved + team;
		return rayCastParams['default'][lookup]['attack'];
	}
	
	rayCastParams() {
		let moved = this.metaData.hasMoved ? 'pawnMoved' : 'pawnUnmoved'; 
		let team = this.team === ChessGame.WHITE ? 'White' : 'Black';
		let lookup = moved + team;
		return rayCastParams['default'][lookup]['behavior'];
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