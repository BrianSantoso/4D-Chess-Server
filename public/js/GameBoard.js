import ChessGame from "./ChessGame.js";
import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";
import Move from "./Move.js";

class GameBoard {
	constructor() {
		this.n = 4;
		this._pieces = null;
		this._init4D();
	}
	
	set(x, y, z, w, piece) {
		this._pieces[x][y][z][w] = piece;
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
		let behaviors = originPiece.behavior();
		let moves = [];
		behaviors.forEach(pieceBehavior => {
			// TODO loop over all combinations of units and valid dirs
			moves = Move.union(mvoes, this._rayCast(x, y, z, w, ));
		});
		// TODO: ...
	}
	
	_rayCast(x, y, z, w, directions, maxSteps, canCapture) {
		let [startX, startY, startZ, startW] = [x, y, z, w];
		let originPiece = this.get(x, y, z, w);
		if (originPiece.isEmpty()) {
			return null;
		}
		let team = originPiece.team;
		let [dx, dy, dz, dw] = directions;
		let moves = [];
		while(maxSteps-- > 0 && 
			  this.inBounds(x += dx, y += dy, z += dz, w += dw)){
			
			let target = this.get(x, y, z, w);
			if (originPiece.oppositeTeam(target) && canCapture) {
				moves.push(new Move(startX, startY, startZ, startW, originPiece, target, null));
				break;
			} else if(targetPiece.isEmpty()) {
				moves.push(new Move(startX, startY, startZ, startW, originPiece, target, null));
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
		
		this.set(0, 0, 0, 0, new Rook(ChessGame.WHITE));
		this.set(1, 0, 0, 0, new Knight(ChessGame.WHITE));
		this.set(2, 0, 0, 0, new Knight(ChessGame.WHITE));
		this.set(3, 0, 0, 0, new Rook(ChessGame.WHITE));
		
		this.set(0, 1, 0, 0, new Bishop(ChessGame.WHITE));
		this.set(1, 1, 0, 0, new Pawn(ChessGame.WHITE));
		this.set(2, 1, 0, 0, new Pawn(ChessGame.WHITE));
		this.set(3, 1, 0, 0, new Bishop(ChessGame.WHITE));
		
		this.set(0, 2, 0, 0, new Bishop(ChessGame.WHITE));
		this.set(1, 2, 0, 0, new Queen(ChessGame.WHITE));
		this.set(2, 2, 0, 0, new King(ChessGame.WHITE));
		this.set(3, 2, 0, 0, new Bishop(ChessGame.WHITE));
		
		this.set(0, 3, 0, 0, new Rook(ChessGame.WHITE));
		this.set(1, 3, 0, 0, new Knight(ChessGame.WHITE));
		this.set(2, 3, 0, 0, new Knight(ChessGame.WHITE));
		this.set(3, 3, 0, 0, new Rook(ChessGame.WHITE));
	}
	
}

export default GameBoard;