import GameBoard from "./GameBoard.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";
import Piece from "./Piece.js";
import { LocalPlayer3D, OnlinePlayer3D } from "./ChessPlayer.js";

class ChessGame {	
	constructor(n) {
		this._board = new GameBoard(n);
		this._moveManager;
		this._controllers = [];
	}
	
	makeMove(move) {
		this.board().makeMove(move);
		// TODO: add move to history
	}
	
	board() {
		return this._board;
	}
	
	keyInputs() {
		
	}
	
	update() {
		
	}
}

class GraphicalChessGame extends ChessGame {
	constructor(n) {
		super(n);
		
		this._boardGraphics = new BoardGraphics(n); // 3D View
		this._layerStack; // 2D View
	}
	
	initGraphics() {
		this._boardGraphics.spawnPieces(this._board.getPieces());
	}
	
	setRayCaster(rayCaster) {
		this._rayCaster = rayCaster;
	}
	
	showPossibleMoves(piece) {
		let moves = this.board().getPossibleMoves(piece.x, piece.y, piece.z, piece.w);
		this.boardGraphics().showPossibleMoves(piece, moves);
	}
	
	previewPossibleMoves(piece) {
		let moves = this.board().getPossibleMoves(piece.x, piece.y, piece.z, piece.w);
		this.boardGraphics().previewPossibleMoves(piece, moves);
	}
	
	hidePossibleMoves() {
		this.boardGraphics().hidePossibleMoves();
	}
	
	rayCast() {
		return this.boardGraphics().rayCast(this._rayCaster);
	}
	
	boardGraphics() {
		return this._boardGraphics;
	}
	
	view3D() {
		return this.boardGraphics().view3D();
	}
	
	update() {
		this._boardGraphics.update();
	}
	
	intentionalClick() {
		
	}
	
	makeMove(move) {
		super.makeMove(move);
		// TODO: tell graphics to move piece
		this.boardGraphics().makeMove(move, false);
	}
}

class LocalChessGame extends GraphicalChessGame {
	constructor(n) {
		super(n);
		this._rayCaster = null;
		this.controllers = [new LocalPlayer3D(this), new LocalPlayer3D(this)];
	}
	
	keyInputs() {
		this.controllers.forEach(controller => {
			controller.keyInputs();
		});
	}
	
	intentionalClick() {
		this.controllers.forEach(controller => {
			controller.onclick();
		});
	}
}

class OnlineChessGame extends GraphicalChessGame /* Implements Online */ {
	constructor(n) {
		super(n);
		
		this.controllers = [new OnlinePlayer3D(this), new MoveTransmitter(this)];
	}
}

ChessGame.GHOST = -2;
ChessGame.NONE = -1;
ChessGame.WHITE = 0;
ChessGame.BLACK = 1;
ChessGame.TIE_GAME = 2;

export default ChessGame;
export { LocalChessGame };