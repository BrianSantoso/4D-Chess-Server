import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";

class GameBoard {
	constructor() {
		this._pieces = this._init4D();
	}
	
	_init4D() {
		const range = n => [...Array(n)].map((_, i) => i);
		const rangeIn = dims => {
		  if (!dims.length) return new Piece();
		  return range(dims[0]).map(_ => rangeIn(dims.slice(1)));
		};

		const pieces = rangeIn([this.n, this.n, this.n, this.n])
		return pieces;
	}
}