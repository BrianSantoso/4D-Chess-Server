import ChessGame from "./ChessGame.js";

class Piece {
	constructor(team, x, y, z, w) {
		this.team = team;
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		this.metaData = null;
	}
	
	movement() {
		return null;
	}
	
	attack() {
		// By default, piece attacking behavior is identical to its movement, except that it can capture
		this.movement().map(behavior => {
			let attackingVersion = behavior.copy();
			attackingVersion.canCapture = true;
			return attackingVersion;
		});
	}
	
	behavior() {
		return this.movement() + this.attack();
	}
}

class Pawn extends Piece {
	constructor(team, x, y, z, w) {
		super(team, x, y, z, w);
		this.metaData = {
			hasMoved: false,
			justMovedTwoSpaces: false
		};
	}
	
	movement() {
		let forwards = this.team == ChessGame.WHITE ? 
			PieceBehavior.FORWARD : PieceBehavior.BACKWARD;
		let movement;
		if (this.metaData.hasMoved) {
			movement = [
				new PieceBehavior([1], 1, false, [
					PieceBehavior.BIDIRECTIONAL,
					PieceBehavior.BIDIRECTIONAL,
					forwards,
					forwards
				])
			];
		} else {
			movement = [
				new PieceBehavior([1], 2, false, [
					PieceBehavior.BIDIRECTIONAL,
					PieceBehavior.BIDIRECTIONAL,
					forwards,
					forwards
				])
			];
		}
		
		return movement;
	}
	
	attack() {
		let forwards = this.team == ChessGame.WHITE ? 
			PieceBehavior.FORWARD : PieceBehavior.BACKWARD;
		return [
			new PieceBehavior([1, 1], 1, true, [
				PieceBehavior.BIDIRECTIONAL,
				PieceBehavior.BIDIRECTIONAL,
				forwards,
				forwards
			])
		];
	}
}

class King extends Piece {
	movement() {
		let orthogonal = new PieceBehavior([1], 1);
		let diagonal = new PieceBehavior([1, 1], 1);
		return [orthogonal, diagonal];
	}
}

class Queen extends Piece {
	movement() {
		let orthogonal = new PieceBehavior([1], Infinity);
		let diagonal = new PieceBehavior([1, 1], Infinity);
		return [orthogonal, diagonal];
	}
}

class Bishop extends Piece {
	movement() {
		let diagonal = new PieceBehavior([1, 1], Infinity);
		return [diagonal];
	}
}

class Knight extends Piece {
	movement() {
		let L1 = new PieceBehavior([1, 2], 1);
		let L2 = new PieceBehavior([2, 1], 1);
		return [L1, L2];
	}
}

class Rook extends Piece {
	movement() {
		let orthogonal = new PieceBehavior([1], Infinity);
		return [orthogonal];
	}
}

class PieceBehavior {
	
	// Describes a raycast operation
	constructor(units, maxSteps, canCapture=false, validDirections=[PieceBehavior.BIDIRECTIONAL, PieceBehavior.BIDIRECTIONAL, PieceBehavior.BIDIRECTIONAL, PieceBehavior.BIDIRECTIONAL]) {
		this.units = units; // Number of units to step in any axis. Denote a different axis by an additional unit in the array
		this.maxSteps = maxSteps;
		this.canCapture = canCapture // Whether piece can capture another piece. Used to differentiate between movement and attacks
		this.validDirections = validDirections;
	}
	
	copy() {
		return new PieceBehavior(this.units, this.maxSteps, this.canCapture, this.validDirections);
	}
}

PieceBehavior.FORWARD = 1;
PieceBehavior.BACKWARD = -1;
PieceBehavior.BIDIRECTIONAL = 2;
PieceBehavior.CANT_MOVE = 0;

export default Piece;