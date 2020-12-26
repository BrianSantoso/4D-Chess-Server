import ChessTeam from "./ChessTeam.js";
import Piece, { Queen } from "./Piece.js";
import { initTeam8181, initTeam4444 } from "./BoardConfigs.js";
import Move from "./Move.js";

import { unique } from "./ArrayUtils.js";

class GameBoard {
	constructor() {
		// TODO: Potential memory attack. Possible to make moves that add pieces 
		// to allPieces, then undo moves, and make new move to rewrite history. 
		// Then added pieces from overwritten history still remain in allPieces 
		// and so also in serialized form.
		this._allPieces = [];
		this._pieces = null;
	}

	initialized() {
		return !!this.getPieces();
	}
	
	getPieces() {
		return this._pieces;
	}

	allPieces() {
		return this._allPieces;
	}

	spawn(x, y, z, w, piece) {
		piece.assignId(this._allPieces.length);
		this._allPieces.push(piece);
		this.set(x, y, z, w, piece);
	}
	
	set(x, y, z, w, piece) {
		this._pieces[x][y][z][w] = piece;
		piece.set(x, y, z, w);
	}

	undoMove(move) {
		let piece = this.getById(move.pieceId);
		let capturedPiece = this.getById(move.capturedPieceId);
		this.set(move.x0, move.y0, move.z0, move.w0, piece);
		this.set(move.x1, move.y1, move.z1, move.w1, capturedPiece);
		if (move.isFirstMove) {
			piece.hasMoved = false;
		}
	}

	redoMove(move) {
		let piece = this.getById(move.pieceId);
		// check for pawn promotion
		if (move.promotionNew) {
			let promotionNew = this.getById(move.promotionNew.id);
			this.set(move.x1, move.y1, move.z1, move.w1, promotionNew);
		} else {
			this.set(move.x1, move.y1, move.z1, move.w1, piece);
		}

		this.set(move.x0, move.y0, move.z0, move.w0, new Piece());
		
		// Assumes redoing a move is equivalent to making the move.
		piece.update();
	}
	
	makeMove(move) {
		let piece = this.getById(move.pieceId);
		// check for pawn promotion
		if (move.promotionNew) {
			this.spawn(move.x1, move.y1, move.z1, move.w1, move.promotionNew);
		} else {
			let piece = this.getById(move.pieceId);
			this.set(move.x1, move.y1, move.z1, move.w1, piece);
		}

		this.set(move.x0, move.y0, move.z0, move.w0, new Piece());
		
		piece.update();
	}
	
	get(x, y, z, w) {
		return this._pieces[x][y][z][w];
	}
	
	inBounds(x, y, z, w) {
		return x >= 0 && x < this._x() && 
				y >= 0 && y < this._y() && 
				z >= 0 && z < this._z() && 
				w >= 0 && w < this._w();
	}

	isClassic() {
		return this._z() === 1 && this._w() === 1;
	}
	
	getPossibleMoves(x, y, z, w, legalOnly=true, attacksOnly=false) {
		// Returns list of possible moves for a piece at the given
		// coordinates. legalOnly=false specifies moves as if there
		// are no pins/checks
		let originPiece = this.get(x, y, z, w);
		let result = [];
		
		if (originPiece.isEmpty()) {
			return result;
		}
		
		let paramsList = attacksOnly ? originPiece.attackRayCastParams() : originPiece.rayCastParams();
		// let paramsList = originPiece.rayCastParams();

		paramsList.forEach(args => {
			let moves = this._rayCast(x, y, z, w, args.direction, 
									  args.maxSteps, args.canCapture);
			result.push(...moves);
		});
		
		result = unique(result, Move.hash);

		if (legalOnly) {
			// Must impose this extra condition to prevent mutual recursion 
			// between getPossibleMoves and inCheck 
			// (getLegalMoves -> isLegal -> inCheck)
			let legal = (move) => this.isLegal(move).length === 0;
			result = result.filter(legal);
		}
		return result;
	}
	
	inCheck(team) {
		let isKing = (piece) => {
			return piece.type === 'King' && piece.team === team;
		}
		let exit = (piece) => true;
		let king = this._applyTo(exit, isKing);
		
		let oppositeTeam = (piece) => piece.oppositeTeam(king);
		let attacksKing = (piece) => {
			// Must request legalOnly=false to prevent mutual recursion
			// between inCheck and getPossibleMoves
			// (getLegalMoves -> isLegal -> inCheck)
			let moves = this.getPossibleMoves(piece.x, piece.y, piece.z, piece.w, false, true);
			let attacks = moves.filter(move => move.isCapture());
			return attacks.some(move => {
				let capturedPiece = this.getById(move.capturedPieceId);
				return capturedPiece === king
			});
		}
		let predicate = (piece) => oppositeTeam(piece) && attacksKing(piece);
		
		let attackers = [];
		let grab = (piece) => {
			attackers.push(piece);
			return false;
		}
		this._applyTo(grab, predicate);
		return attackers;
	}
	
	getAllPossibleMoves(team, legalOnly=true) {
		let moves = [];
		let sameTeam = (piece) => piece.team === team;
		let grabMoves = (piece) => {
			moves = moves.concat(this.getPossibleMoves(piece.x, piece.y, piece.z, piece.w, legalOnly));
		}
		this._applyTo(grabMoves, sameTeam);
		return moves;
	}
	
	isLegal(move) {
		// Simulate move
		let piece = this.getById(move.pieceId);
		
		let temp = this.get(move.x1, move.y1, move.z1, move.w1, piece);
		this.set(move.x1, move.y1, move.z1, move.w1, piece);
		this.set(move.x0, move.y0, move.z0, move.w0, new Piece())
		
		let attackers = this.inCheck(piece.team);
		
		// Return board to its original state
		this.set(move.x1, move.y1, move.z1, move.w1, temp);
		this.set(move.x0, move.y0, move.z0, move.w0, piece);
		
		return attackers;
	}

	getById(id) {
		if (id === undefined) {
			return new Piece();
		}
		return this._allPieces[id];
	}
	
	_applyTo(f, predicate) {
		// Applies f to all pieces satisfying predicate. If f returns true, 
		// iteration stops and the piece which caused the exit is returned.
		predicate = predicate || (() => true);
		for (let x = 0; x < this._x(); x++) {
			for (let y = 0; y < this._y(); y++) {
				for (let z = 0; z < this._z(); z++) {
					for (let w = 0; w < this._w(); w++) {
						let piece = this._pieces[x][y][z][w];
						if (predicate(piece) && f(piece)) {
							return piece;
						}
					}
				}
			}
		}
		return null;
	}
	
	_rayCast(x, y, z, w, direction, maxSteps, canCapture) {
		let [startX, startY, startZ, startW] = [x, y, z, w];
		if (maxSteps === null) {
			maxSteps = Infinity;
		}
		let originPiece = this.get(x, y, z, w);
		if (originPiece.isEmpty()) {
			return null;
		}
		let team = originPiece.team;
		let [dx, dy, dz, dw] = direction;
		let moves = [];
		while(maxSteps-- > 0 && 
			  this.inBounds(x += dx, y += dy, z += dz, w += dw)){
			
			let target = this.get(x, y, z, w);
								  
			let promotion = originPiece.type === 'Pawn' && this._isPromotionSquare(x, y, z, w);
			let promotionNew = null;
			if (promotion) {
				// why not call this.set(x, y, z, w, promotionNew) ?
				promotionNew = new Queen(team);
				promotionNew.set(x, y, z, w);
			}

			let isFirstMove = !originPiece.hasMoved;
			
			let isCapture = originPiece.oppositeTeam(target) && canCapture;
			let normalMove = target.isEmpty() && !canCapture;
			let obstructed = !target.isEmpty();

			if (isCapture) {
				let potentialMove = new Move(startX, startY, startZ, startW, 
									x, y, z, w, originPiece.id, target.id, 
									promotionNew, isFirstMove);
				moves.push(potentialMove);
				break;
			} else if(normalMove) {
				let potentialMove = new Move(startX, startY, startZ, startW, 
									x, y, z, w, originPiece.id, target.id, 
									promotionNew, isFirstMove);
				moves.push(potentialMove);
			} else if (obstructed) {
				break;
			}
		}
		
		return moves;
	}
	
	_isPromotionSquare(x, y, z, w) {
		return (z === 0 && w === 0) || (z === this._z() - 1 && w === this._w() - 1);
	}
	
	_init4D(dim) {
		const range = n => [...Array(n)].map((_, i) => i);
		const rangeIn = dims => {
		  if (!dims.length) return new Piece();
		  return range(dims[0]).map(_ => rangeIn(dims.slice(1)));
		};

		// Create 4D array of Piece objects
		this._pieces = rangeIn(dim);
		
		let z0 = this._z() - 1; // Last Rank
		let z1 = this._z() - 2; // Penultimate Rank
		let w0 = this._w() - 1; // Last Rank
		let w1 = this._w() - 2; // Penultimate Rank
		
		// initTeam4444.apply(this, ChessTeam.WHITE, 0, 1, 0, 1);
		// initTeam4444.apply(this, ChessTeam.BLACK, z0, z1, w0, w1);
		initTeam8181.call(this, ChessTeam.WHITE, 0, 1);
		initTeam8181.call(this, ChessTeam.BLACK, z0, z1);

		// let str = JSON.stringify(this._pieces);
		// let obj = JSON.parse(str);
		// console.log(str);
		// console.log(obj);
	}

	_x() {
		return this._pieces.length;
	}

	_y() {
		return this._pieces[0].length;
	}

	_z() {
		return this._pieces[0][0].length;
	}

	_w() {
		return this._pieces[0][0][0].length;
	}
	
}

GameBoard.create = (dim) => {
	let board = new GameBoard();
	board._init4D(dim);
	return board;
}

GameBoard.revive = (fields) => {

	const range = n => [...Array(n)].map((_, i) => i);
	const rangeIn = dims => {
		if (!dims.length) return null;
		return range(dims[0]).map(_ => rangeIn(dims.slice(1)));
	};

	// Create 4D array with same dimensions
	let dim = [
		fields._pieces.length,
		fields._pieces[0].length,
		fields._pieces[0][0].length,
		fields._pieces[0][0][0].length
	];
	let [_x, _y, _z, _w] = dim;
	let _pieces = rangeIn(dim);

	for (let x = 0; x < _x; x++) {
		for (let y = 0; y < _y; y++) {
			for (let z = 0; z < _z; z++) {
				for (let w = 0; w < _w; w++) {
					let piece = fields._pieces[x][y][z][w];
					_pieces[x][y][z][w] = Piece.revive(piece);
				}
			}
		}
	}

	let _allPieces = fields._allPieces.map(Piece.revive);

	return Object.assign(new GameBoard(), fields, {
		_pieces: _pieces,
		_allPieces: _allPieces
	});
};

export default GameBoard;