import ChessGame from "./ChessGame.js";
import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";
import Move from "./Move.js";

import { unique } from "./ArrayUtils.js";

class GameBoard {
	constructor(n) {
		this.n = n;
		this._pieces = null;
		this._init4D();
	}
	
	getPieces() {
		return this._pieces;
	}
	
	set(x, y, z, w, piece) {
		this._pieces[x][y][z][w] = piece;
		piece.set(x, y, z, w);
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
		return x >= 0 && x < this.n && 
				y >= 0 && y < this.n && 
				z >= 0 && z < this.n && 
				w >= 0 && w < this.n
	}
	
	getPossibleMoves(x, y, z, w, attacksOnly=false) {
		let originPiece = this.get(x, y, z, w);
		let result = [];
		
		if (originPiece.isEmpty()) {
			return result;
		}
		
		let paramsList = attacksOnly ? originPiece.attackRayCastParams() : originPiece.rayCastParams();
		
		paramsList.forEach(args => {
			let moves = this._rayCast(x, y, z, w, args.direction, 
									  args.maxSteps, args.canCapture);
			result.push(...moves);
		});
		
		result = unique(result);
		// TODO: filter by legality
		if (!attacksOnly) {
			result = result.filter(this.isLegal.bind(this));
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
			let moves = this.getPossibleMoves(piece.x, piece.y, piece.z, piece.w, true);
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
	
	isLegal(move) {
		// Simulate move
		let temp = this.get(move.x1, move.y1, move.z1, move.w1, move.piece);
		this.set(move.x1, move.y1, move.z1, move.w1, move.piece);
		this.set(move.x0, move.y0, move.z0, move.w0, new Piece())
		
		let attackers = this.inCheck(move.piece.team);
		let isLegal = attackers.length === 0;
		
		// Return board to normal state
		this.set(move.x1, move.y1, move.z1, move.w1, temp);
		this.set(move.x0, move.y0, move.z0, move.w0, move.piece);
		
		return isLegal;
	}
	
	_applyTo(f, predicate) {
		// Applies f to all pieces satisfying predicate. If f returns true, 
		// iteration stops and the piece which caused the exit is returned.
		predicate = predicate || (() => true);
		for (let x = 0; x < this._pieces.length; x++) {
			for (let y = 0; y < this._pieces[0].length; y++) {
				for (let z = 0; z < this._pieces[0][0].length; z++) {
					for (let w = 0; w < this._pieces[0][0][0].length; w++) {
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
		return (z === 0 && w === 0) || (z === this.n - 1 && w === this. n - 1);
	}
	
	_init4D() {
		const range = n => [...Array(n)].map((_, i) => i);
		const rangeIn = dims => {
		  if (!dims.length) return new Piece();
		  return range(dims[0]).map(_ => rangeIn(dims.slice(1)));
		};

		// Create 4D array of Piece objects
		this._pieces = rangeIn([this.n, this.n, this.n, this.n])
		
		console.log(this._pieces)
		
		let a = this.n - 1; // Last Rank
		let b = this.n - 2; // Penultimate Rank
		
		const initTeam = (team, a, b) => {
			// a: back rank
			// b: penultimate rank
			this.set(0, 0, a, a, new Rook(team));
			this.set(1, 0, a, a, new Knight(team));
			this.set(2, 0, a, a, new Knight(team));
			this.set(3, 0, a, a, new Rook(team));

			this.set(0, 1, a, a, new Bishop(team));
			this.set(1, 1, a, a, new Queen(team));
			this.set(2, 1, a, a, new Queen(team));
			this.set(3, 1, a, a, new Bishop(team));

			this.set(0, 2, a, a, new Bishop(team));
			this.set(1, 2, a, a, new Queen(team));
			this.set(2, 2, a, a, new King(team));
			this.set(3, 2, a, a, new Bishop(team));

			this.set(0, 3, a, a, new Rook(team));
			this.set(1, 3, a, a, new Knight(team));
			this.set(2, 3, a, a, new Knight(team));
			this.set(3, 3, a, a, new Rook(team));
			
			
			
			

			this.set(0, 0, b, a, new Pawn(team));
			this.set(1, 0, b, a, new Pawn(team));
			this.set(2, 0, b, a, new Pawn(team));
			this.set(3, 0, b, a, new Pawn(team));

			this.set(0, 1, b, a, new Pawn(team));
			this.set(1, 1, b, a, new Pawn(team));
			this.set(2, 1, b, a, new Pawn(team));
			this.set(3, 1, b, a, new Pawn(team));

			this.set(0, 2, b, a, new Pawn(team));
			this.set(1, 2, b, a, new Pawn(team));
			this.set(2, 2, b, a, new Pawn(team));
			this.set(3, 2, b, a, new Pawn(team));

			this.set(0, 3, b, a, new Pawn(team));
			this.set(1, 3, b, a, new Pawn(team));
			this.set(2, 3, b, a, new Pawn(team));
			this.set(3, 3, b, a, new Pawn(team));
			
			
			
			
			this.set(0, 0, a, b, new Pawn(team));
			this.set(1, 0, a, b, new Pawn(team));
			this.set(2, 0, a, b, new Pawn(team));
			this.set(3, 0, a, b, new Pawn(team));

			this.set(0, 1, a, b, new Pawn(team));
			this.set(1, 1, a, b, new Pawn(team));
			this.set(2, 1, a, b, new Pawn(team));
			this.set(3, 1, a, b, new Pawn(team));

			this.set(0, 2, a, b, new Pawn(team));
			this.set(1, 2, a, b, new Pawn(team));
			this.set(2, 2, a, b, new Pawn(team));
			this.set(3, 2, a, b, new Pawn(team));

			this.set(0, 3, a, b, new Pawn(team));
			this.set(1, 3, a, b, new Pawn(team));
			this.set(2, 3, a, b, new Pawn(team));
			this.set(3, 3, a, b, new Pawn(team));
			
			
			
			this.set(0, 0, b, b, new Pawn(team));
			this.set(1, 0, b, b, new Pawn(team));
			this.set(2, 0, b, b, new Pawn(team));
			this.set(3, 0, b, b, new Pawn(team));

			this.set(0, 1, b, b, new Pawn(team));
			this.set(1, 1, b, b, new Pawn(team));
			this.set(2, 1, b, b, new Pawn(team));
			this.set(3, 1, b, b, new Pawn(team));

			this.set(0, 2, b, b, new Pawn(team));
			this.set(1, 2, b, b, new Pawn(team));
			this.set(2, 2, b, b, new Pawn(team));
			this.set(3, 2, b, b, new Pawn(team));

			this.set(0, 3, b, b, new Pawn(team));
			this.set(1, 3, b, b, new Pawn(team));
			this.set(2, 3, b, b, new Pawn(team));
			this.set(3, 3, b, b, new Pawn(team));
		}
		
		initTeam(ChessGame.WHITE, 0, 1);
		initTeam(ChessGame.BLACK, a, b);
	}
	
}

export default GameBoard;