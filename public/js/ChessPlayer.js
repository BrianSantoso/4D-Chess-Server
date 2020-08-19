class ChessPlayer {
	// A ChessGame controller. Defines what method is used to receive moves
	// (e.g. through a 3D UI, over the the internet, an AI),
	// and how to transmit information after making moves
	constructor() {
		
	}
}

class Player3D extends ChessPlayer {
	constructor(chessGame) {
		super();
		this._game = chessGame;
		// uses gameBoard and boardGrahpics
		// transmits directly to chessGame
	}
	
	keyInputs(rayCaster) {
		let gameBoard = this._game.board();
		let boardGraphics = this._game.boardGraphics()
		let intersected = boardGraphics.rayCast(rayCaster);
		
		if (intersected) {
			let piece = intersected.piece;
			let moves = gameBoard.getPossibleMoves(piece.x, piece.y, piece.z, piece.w);
			boardGraphics.showPossibleMoves(piece, moves);
		} else {
			boardGraphics.hidePossibleMoves();
		}
//		console.log(intersected)
	}
}

class LocalPlayer3D extends Player3D {
	// Local Player does not need to transmit anything
	constructor(chessGame) {
		super(chessGame);
	}
}

class OnlinePlayer3D extends Player3D /* implements Transmitter */ {
	
}

class MoveReceiver extends ChessPlayer /* implements Receiver */ {
	constructor(gameBoard, serverToReceiveFrom) {
		super();
	}
}

class MoveReceiverTransmitter extends MoveReceiver /* implements Transmitter */ {
	
}

class AIPlayer extends ChessPlayer {
	
}

export { LocalPlayer3D, OnlinePlayer3D }