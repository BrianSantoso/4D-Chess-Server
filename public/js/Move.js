import { isEqual } from 'lodash';

class Move {
	constructor(x0, y0, z0, w0, x1, y1, z1, w1, piece, capturedPiece, promotionNew) {
		this.x0 = x0;
		this.y0 = y0;
		this.z0 = z0;
		this.w0 = w0;
		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;
		this.w1 = w1;
		this.piece = piece;
		this.capturedPiece = capturedPiece;
		this.promotionNew = promotionNew;
		this.promotionOld = piece;
	}
	
	isCapture() {
		return !this.capturedPiece.isEmpty();
	}

	destinationIs(x1, y1, z1, w1) {
		return this.x1 === x1 &&
				this.y1 === y1 &&
				this.z1 === z1 &&
				this.w1 === w1;
	}

	hash() {
		return Move.hash(this);
	}
}

Move.isEqual = (a, b) => {
	return a.hash() === b.hash();
};

Move.hash = (a) => {
	return JSON.stringify([
		a.x0,
		a.y0,
		a.z0,
		a.w0,
		a.x1,
		a.y1,
		a.z1,
		a.w1,
		a.isCapture()
	]);
}

export default Move;