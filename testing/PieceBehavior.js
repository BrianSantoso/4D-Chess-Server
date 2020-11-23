import { unique } from "../public/js/ArrayUtils.js";
import * as fs from 'fs';

class PieceParamsTemplate {
	constructor(type) {
		this.type = type;
	}
	
	movement() {
		return null;
	}
	
	attack() {
		// By default, piece attacking behavior is identical to its movement, except that it can capture
		let attackBehavior = this.movement().map(behavior => {
			let attackingVersion = behavior.attackingVersion();
			return attackingVersion;
		});
		return attackBehavior;
	}
	
	behavior() {
		return this.movement().concat(this.attack());
	}
	
	attackRayCastParams() {
		if (!this._attackRayCastParams) {
			let behaviors = this.attack();
			let params = behaviors.map(b => b.toRayCastParams()).flat();
			this._attackRayCastParams = unique(params);
		}
		return this._attackRayCastParams;
	}
	
	rayCastParams() {
		if (!this._rayCastParams) {
			let behaviors = this.behavior();
			let params = behaviors.map(b => b.toRayCastParams()).flat();
			this._rayCastParams = unique(params);
		}
		return this._rayCastParams;
	}
}

class PawnUnmoved extends PieceParamsTemplate {
	constructor(team) {
		super('pawnUnmoved'+team);
		this.team = team;
	}
	
	movement() {
		let forwards = this.team == 'White' ? 
			PieceBehavior.FORWARD : PieceBehavior.BACKWARD;
		let movement = [
			PieceBehavior.create([1], 2, false, [
				PieceBehavior.CANT_MOVE,
				PieceBehavior.CANT_MOVE,
				forwards,
				forwards
			])
		];	
		return movement;
	}
	
	attack() {
		let forwards = this.team == 'White' ? 
			PieceBehavior.FORWARD : PieceBehavior.BACKWARD;
		return [
			PieceBehavior.create([1, 1], 1, true, [
				PieceBehavior.BIDIRECTIONAL,
				PieceBehavior.BIDIRECTIONAL,
				forwards,
				forwards
			])
		];
	}
}

class PawnMoved extends PieceParamsTemplate {
	constructor(team) {
		super('pawnMoved'+team);
		this.team = team;
	}
	
	movement() {
		let forwards = this.team == 'White' ? 
			PieceBehavior.FORWARD : PieceBehavior.BACKWARD;
		let movement = [
			PieceBehavior.create([1], 1, false, [
				PieceBehavior.CANT_MOVE,
				PieceBehavior.CANT_MOVE,
				forwards,
				forwards
			])
		];
		return movement;
	}
	
	attack() {
		let forwards = this.team == 'White' ? 
			PieceBehavior.FORWARD : PieceBehavior.BACKWARD;
		return [
			PieceBehavior.create([1, 1], 1, true, [
				PieceBehavior.BIDIRECTIONAL,
				PieceBehavior.BIDIRECTIONAL,
				forwards,
				forwards
			])
		];
	}
}

class King extends PieceParamsTemplate {
	constructor() {
		super('king');
	}
	movement() {
		let orthogonal = PieceBehavior.create([1], 1);
		let diagonal = PieceBehavior.create([1, 1], 1);
		return [orthogonal, diagonal];
	}
}

class Queen extends PieceParamsTemplate {
	constructor() {
		super('queen');
	}
	movement() {
		let orthogonal = PieceBehavior.create([1], Infinity);
		let diagonal = PieceBehavior.create([1, 1], Infinity);
		return [orthogonal, diagonal];
	}
}

class Bishop extends PieceParamsTemplate {
	constructor() {
		super('bishop');
	}
	movement() {
		let diagonal = PieceBehavior.create([1, 1], Infinity);
		return [diagonal];
	}
}

class Knight extends PieceParamsTemplate {
	constructor() {
		super('knight');
	}
	movement() {
		let L = PieceBehavior.create([1, 2], 1);
		return [L];
	}
}

class Rook extends PieceParamsTemplate {
	constructor() {
		super('rook');
	}
	movement() {
		let orthogonal = PieceBehavior.create([1], Infinity);
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
		this._rayCastParams;
	}
	
	attackingVersion() {
		return PieceBehavior.create(this.units, this.maxSteps, true, this.axisRules);
	}
	
	toRayCastParams() {
		// Returns all ray cast directions given for this piece behavior
		if (!this._rayCastParams) {
			let directions = this._permuteReplace();
			this._rayCastParams = directions.map(dir => ({
				direction: dir,
				maxSteps: this.maxSteps,
				canCapture: this.canCapture
			}));
		}
		return this._rayCastParams;
	}
	
	hash() {
		return JSON.stringify([this.units, this.maxSteps, this.canCapture, this.axisRules]);
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

PieceBehavior.cachedBehaviors = {};

PieceBehavior.create = (units, maxSteps, canCapture=false, axisRules=PieceBehavior.ALL_DIRS) => {
	let behavior = new PieceBehavior(units, maxSteps, canCapture, axisRules);
	let hash = behavior.hash();
	let result;
	if (hash in PieceBehavior.cachedBehaviors) {
		return PieceBehavior.cachedBehaviors[hash];
	} else {
		PieceBehavior.cachedBehaviors[hash] = behavior;
		behavior.toRayCastParams();
		return behavior;
	}
	return behavior;
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

PieceBehavior.computeAll = () => {
	let output = {};
	let templates = [
		new PawnUnmoved('White'),
		new PawnUnmoved('Black'),
		new PawnMoved('White'),
		new PawnMoved('Black'),
		new Rook(),
		new Knight(),
		new Bishop(),
		new Queen(),
		new King(),
	];
	templates.forEach(piece => {
		let pieceParams = {
			attack: piece.attackRayCastParams(),
			behavior: piece.rayCastParams()
		}
		output[piece.type] = pieceParams;
	});
	fs.writeFile('./testing/rayCastParams.json', JSON.stringify(output), (err) => {
        if (err) {
			console.log('Error writing file:', err);
		}
    });
	console.log(output);
}

PieceBehavior.computeAll();

export default PieceBehavior;