import ChessGame from "./ChessGame.js";
import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";
import Move from "./Move.js";

import { unique } from "./ArrayUtils.js";

class GameBoard {
	constructor(dim) {
		this._pieces = null;
		this._init4D(dim);
	}
	
	getPieces() {
		return this._pieces;
	}
	
	set(x, y, z, w, piece) {
		this._pieces[x][y][z][w] = piece;
		piece.set(x, y, z, w);
	}

	undoMove(move) {
		this.set(move.x0, move.y0, move.z0, move.w0, move.piece);
		this.set(move.x1, move.y1, move.z1, move.w1, move.capturedPiece);

	}
	
	makeMove(move) {
		if (move.promotionNew) {
			this.set(move.x1, move.y1, move.z1, move.w1, move.promotionNew);
		} else {
			this.set(move.x1, move.y1, move.z1, move.w1, move.piece);
		}
		
		// check for pawn promotion
		this.set(move.x0, move.y0, move.z0, move.w0, new Piece());
		
		// if not undoing a move
		move.piece.update();
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
			return piece.type === 'king' && piece.team === team;
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
			return attacks.some(move => move.capturedPiece === king);
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
		let temp = this.get(move.x1, move.y1, move.z1, move.w1, move.piece);
		this.set(move.x1, move.y1, move.z1, move.w1, move.piece);
		this.set(move.x0, move.y0, move.z0, move.w0, new Piece())
		
		let attackers = this.inCheck(move.piece.team);
		
		// Return board to its original state
		this.set(move.x1, move.y1, move.z1, move.w1, temp);
		this.set(move.x0, move.y0, move.z0, move.w0, move.piece);
		
		return attackers;
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
								  
			let promotion = originPiece.type === 'pawn' && this._isPromotionSquare(x, y, z, w);
			let promotionNew = null;
			if (promotion) {
				// why not call this.set(x, y, z, w, promotionNew) ?
				promotionNew = new Queen(team);
				promotionNew.set(x, y, z, w);
			}
			
			if (originPiece.oppositeTeam(target) && canCapture) {
				moves.push(new Move(startX, startY, startZ, startW, x, y, z, w, originPiece, target, promotionNew));
				break;
			} else if(target.isEmpty() && !canCapture) {
				moves.push(new Move(startX, startY, startZ, startW, x, y, z, w, originPiece, target, promotionNew));
			} else if (!target.isEmpty()) {
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
		this._pieces = rangeIn(dim)
		
		console.log(this._pieces)
		
		let z_0 = this._z() - 1; // Last Rank
		let z_1 = this._z() - 2; // Penultimate Rank
		let w_0 = this._w() - 1; // Last Rank
		let w_1 = this._w() - 2; // Penultimate Rank
		
		const initTeam = (team, z_0, z_1, w_0, w_1) => {
			// a: back rank
			// b: penultimate rank
			this.set(0, 0, z_0, w_0, new Rook(team));
			this.set(1, 0, z_0, w_0, new Knight(team));
			this.set(2, 0, z_0, w_0, new Knight(team));
			this.set(3, 0, z_0, w_0, new Rook(team));

			this.set(0, 1, z_0, w_0, new Bishop(team));
			this.set(1, 1, z_0, w_0, new Queen(team));
			this.set(2, 1, z_0, w_0, new Queen(team));
			this.set(3, 1, z_0, w_0, new Bishop(team));

			this.set(0, 2, z_0, w_0, new Bishop(team));
			this.set(1, 2, z_0, w_0, new Queen(team));
			this.set(2, 2, z_0, w_0, new King(team));
			this.set(3, 2, z_0, w_0, new Bishop(team));

			this.set(0, 3, z_0, w_0, new Rook(team));
			this.set(1, 3, z_0, w_0, new Knight(team));
			this.set(2, 3, z_0, w_0, new Knight(team));
			this.set(3, 3, z_0, w_0, new Rook(team));
			
			
			
			

			this.set(0, 0, z_1, w_0, new Pawn(team));
			this.set(1, 0, z_1, w_0, new Pawn(team));
			this.set(2, 0, z_1, w_0, new Pawn(team));
			this.set(3, 0, z_1, w_0, new Pawn(team));

			this.set(0, 1, z_1, w_0, new Pawn(team));
			this.set(1, 1, z_1, w_0, new Pawn(team));
			this.set(2, 1, z_1, w_0, new Pawn(team));
			this.set(3, 1, z_1, w_0, new Pawn(team));

			this.set(0, 2, z_1, w_0, new Pawn(team));
			this.set(1, 2, z_1, w_0, new Pawn(team));
			this.set(2, 2, z_1, w_0, new Pawn(team));
			this.set(3, 2, z_1, w_0, new Pawn(team));

			this.set(0, 3, z_1, w_0, new Pawn(team));
			this.set(1, 3, z_1, w_0, new Pawn(team));
			this.set(2, 3, z_1, w_0, new Pawn(team));
			this.set(3, 3, z_1, w_0, new Pawn(team));
			
			
			
			
			this.set(0, 0, z_0, w_1, new Pawn(team));
			this.set(1, 0, z_0, w_1, new Pawn(team));
			this.set(2, 0, z_0, w_1, new Pawn(team));
			this.set(3, 0, z_0, w_1, new Pawn(team));

			this.set(0, 1, z_0, w_1, new Pawn(team));
			this.set(1, 1, z_0, w_1, new Pawn(team));
			this.set(2, 1, z_0, w_1, new Pawn(team));
			this.set(3, 1, z_0, w_1, new Pawn(team));

			this.set(0, 2, z_0, w_1, new Pawn(team));
			this.set(1, 2, z_0, w_1, new Pawn(team));
			this.set(2, 2, z_0, w_1, new Pawn(team));
			this.set(3, 2, z_0, w_1, new Pawn(team));

			this.set(0, 3, z_0, w_1, new Pawn(team));
			this.set(1, 3, z_0, w_1, new Pawn(team));
			this.set(2, 3, z_0, w_1, new Pawn(team));
			this.set(3, 3, z_0, w_1, new Pawn(team));
			
			
			
			this.set(0, 0, z_1, w_1, new Pawn(team));
			this.set(1, 0, z_1, w_1, new Pawn(team));
			this.set(2, 0, z_1, w_1, new Pawn(team));
			this.set(3, 0, z_1, w_1, new Pawn(team));

			this.set(0, 1, z_1, w_1, new Pawn(team));
			this.set(1, 1, z_1, w_1, new Pawn(team));
			this.set(2, 1, z_1, w_1, new Pawn(team));
			this.set(3, 1, z_1, w_1, new Pawn(team));

			this.set(0, 2, z_1, w_1, new Pawn(team));
			this.set(1, 2, z_1, w_1, new Pawn(team));
			this.set(2, 2, z_1, w_1, new Pawn(team));
			this.set(3, 2, z_1, w_1, new Pawn(team));

			this.set(0, 3, z_1, w_1, new Pawn(team));
			this.set(1, 3, z_1, w_1, new Pawn(team));
			this.set(2, 3, z_1, w_1, new Pawn(team));
			this.set(3, 3, z_1, w_1, new Pawn(team));
		}

		// Debugging tool
		const initCheckmate = (team, z_0, z_1, w_0, w_1) => {
			let opp = ChessGame.oppositeTeam(team);
			this.set(0, 0, z_0, w_0, new King(team));

			this.set(0, 1, z_0, w_0, new Queen(opp));
			this.set(1, 0, z_0, w_0, new Queen(opp));
			this.set(1, 1, z_0, w_0, new Queen(opp));
			this.set(0, 0, z_0, w_1, new Queen(opp));
			this.set(0, 0, z_1, w_0, new Queen(opp));
			this.set(0, 0, z_1, w_1, new Queen(opp));
		}
		
		initTeam(ChessGame.WHITE, 0, 1, 0, 1);
		// initCheckmate(ChessGame.WHITE, 0, 1);
		initTeam(ChessGame.BLACK, z_0, z_1, w_0, w_1);
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

export default GameBoard;