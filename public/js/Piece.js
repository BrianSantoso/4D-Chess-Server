import ChessGame from "./ChessGame.js";
import { unique } from "./ArrayUtils.js";

class Piece {
	constructor(team=-1) {
		this.team = team;
		this.metaData = null;
	}
	
	movement() {
		return null;
	}
	
	attack() {
		// By default, piece attacking behavior is identical to its movement, except that it can capture
		let attackBehavior = this.movement().map(behavior => {
			let attackingVersion = behavior.copy();
			attackingVersion.canCapture = true;
			return attackingVersion;
		});
		return attackBehavior;
	}
	
	behavior() {
		return this.movement().concat(this.attack());
	}
	
	attackRayCastParams() {
		let behaviors = this.attack();
		let params = behaviors.map(b => b.toRayCastParams()).flat();
		return unique(params);
	}
	
	rayCastParams() {
		let behaviors = this.behavior();
		let params = behaviors.map(b => b.toRayCastParams()).flat();
		return unique(params);
	}
	
	oppositeTeam(otherPiece) {
		if (this.team == ChessGame.WHITE) {
			return otherPiece.team == ChessGame.BLACK;
		} else if (this.team = ChessGame.BLACK) {
			return otherPiece.team == ChessGame.WHITE;
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
		let L = new PieceBehavior([1, 2], 1);
		return [L];
	}
}

class Rook extends Piece {
	movement() {
		let orthogonal = new PieceBehavior([1], Infinity);
		return [orthogonal];
	}
}

class PieceBehavior {
	// TODO: PieceBehaviors and their rayCastParams can be cached for potential optimization
	
	// Describes a raycast operation
	constructor(units, maxSteps, canCapture=false, axisRules=PieceBehavior.ALL_DIRS) {
		this.units = units; // Number of units to step in any axis. Denote a different axis by an additional unit in the array
		this.maxSteps = maxSteps;
		this.canCapture = canCapture // Whether piece can capture another piece. Used to differentiate between movement and attacks
		this.axisRules = axisRules;
	}
	
	copy() {
		return new PieceBehavior(this.units, this.maxSteps, this.canCapture, this.axisRules);
	}
	
	toRayCastParams() {
		// Returns all ray cast directions given for this piece behavior
		
		let directions = this._permuteReplace();
		return directions.map(dir => ({
			direction: dir,
			maxSteps: this.maxSteps,
			canCapture: this.canCapture
		}));
	}
	
	_expandAxisRules() {
		// Replaces all BIDIRECTIONAL in axisRules with a FORWARD and BACKWARDs
		const appendToAll = (arrs, item) =>
			arrs.map(inner => 
				inner.concat([item])
			)
		
		let result = [[]];
		this.axisRules.forEach(rule => {
			if (rule == PieceBehavior.BIDIRECTIONAL) {
				let pos = appendToAll(result, PieceBehavior.FORWARD);
				let neg = appendToAll(result, PieceBehavior.BACKWARD);
				result = pos.concat(neg);
			} else {
				result = appendToAll(result, rule);
			}
		});
		return result;
	}
	
	_permuteReplace() {
		// Returns all permutations of this.units on this.axisRules
		// Permute(axisRules, units) = [...list of ray cast directions]
		
		// Insert an item to beginning of every array in a list of arrays
		const insertToAll = (item, arrs) => 
			arrs.map(inner => [item].concat(inner))
		
		const permuteReplace = (units, axis) => {
			if (axis.length == 0) {
				if (units.length > 0) {
					return []; // There are still items in units left, but no axis, so invalidate
				} else {
					return [[]]; // We reached the end of axis, so construct a new list for this path
				}
			}
			
			if (axis[0] == PieceBehavior.NONE) {
				// Can't replace NONE, so skip
				return insertToAll(0, permuteReplace(units, axis.slice(1)));
			}
			
			if (units.length == 0) {
				// There are still some axis left, so pad with 0's
				return insertToAll(0, permuteReplace(units, axis.slice(1)));
			}
			
			let result = []
			// replace current slot (axis[0]) with one of each unit
			for (let i = 0; i < units.length; i++) {
				let unit = units[i] * axis[0];
				let rest = [...units]
				rest.splice(i, 1);
				result = result.concat(insertToAll(unit, permuteReplace(rest, axis.slice(1))));
			}
			
			// use none of the units to replace this slot, so skip
			result = result.concat(insertToAll(0, permuteReplace(units, axis.slice(1))));
			return result;
		}
		
		let axisRules = this._expandAxisRules();
		let directions = axisRules.map(axisRule => {
			let dirs = permuteReplace(this.units, axisRule);
			let uniqueDirs = unique(dirs)
			return uniqueDirs;
		});
		directions = directions.flat();
		return unique(directions);
	}
	
}



PieceBehavior.BACKWARD = -1;
PieceBehavior.CANT_MOVE = 0;
PieceBehavior.FORWARD = 1;
PieceBehavior.BIDIRECTIONAL = 2;
PieceBehavior.ALL_DIRS = [
	PieceBehavior.BIDIRECTIONAL, 
	PieceBehavior.BIDIRECTIONAL, 
	PieceBehavior.BIDIRECTIONAL, 
	PieceBehavior.BIDIRECTIONAL
];

export default Piece;
export { Pawn, Rook, Knight, Bishop, King, Queen };