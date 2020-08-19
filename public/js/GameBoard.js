import ChessGame from "./ChessGame.js";
import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";
import Move from "./Move.js";

import { unique } from "./ArrayUtils.js";

class GameBoard {
	constructor(n) {
		this.n = n;
		this._pieces = null;
		this._init4D();
		
		console.log(this.getPossibleMoves(0, 0, 1, 1))
	}
	
	getPieces() {
		return this._pieces;
	}
	
	set(x, y, z, w, piece) {
		this._pieces[x][y][z][w] = piece;
		piece.set(x, y, z, w);
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
	
	getPossibleMoves(x, y, z, w) {
		let originPiece = this.get(x, y, z, w);
		let paramsList = originPiece.rayCastParams();
		let result = [];
		paramsList.forEach(args => {
			let moves = this._rayCast(x, y, z, w, args.direction, 
									  args.maxSteps, args.canCapture);
			result.push(...moves);
		});
		return unique(result);
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
			if (originPiece.oppositeTeam(target) && canCapture) {
				moves.push(new Move(startX, startY, startZ, startW, x, y, z, w, originPiece, target, null));
				break;
			} else if(target.isEmpty() && !canCapture) {
				moves.push(new Move(startX, startY, startZ, startW, x, y, z, w, originPiece, target, null));
			} else if (originPiece.sameTeam(target)) {
				break;
			}
		}
		
		return moves;
	}
	
	_init4D() {
		const range = n => [...Array(n)].map((_, i) => i);
		const rangeIn = dims => {
		  if (!dims.length) return new Piece();
		  return range(dims[0]).map(_ => rangeIn(dims.slice(1)));
		};

		// Create 4D array of Piece objects
		this._pieces = rangeIn(new Array(this.n).fill(this.n))
		
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
			this.set(1, 1, a, a, new Pawn(team));
			this.set(2, 1, a, a, new Pawn(team));
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