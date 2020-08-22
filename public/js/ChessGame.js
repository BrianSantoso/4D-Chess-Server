import GameBoard from "./GameBoard.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";
import Piece from "./Piece.js";
import { LocalPlayer3D, OnlinePlayer3D } from "./ChessPlayer.js";

class ChessGame {	
	constructor(n) {
		this._board = new GameBoard(n);
//		this._moveManager;
		this._controllers = [];
		this._turn = ChessGame.WHITE;
		this._mode = null;
		this._moveHistory = []; // TODO: doubly linked list of moves
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
		
		this._rayCaster = null;
		this._controllers = [ // TODO: assign teams dynamically...
//			new LocalPlayer3D(this, ChessGame.OMNISCIENT), 
			new LocalPlayer3D(this, ChessGame.OMNISCIENT)
		];
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
	
	rayCast(targetTeam) {
		return this.boardGraphics().rayCast(this._rayCaster, targetTeam);
	}
	
	boardGraphics() {
		return this._boardGraphics;
	}
	
	view3D() {
		return this.boardGraphics().view3D();
	}
	
	keyInputs() {
		this._controllers.forEach(controller => {
			controller.keyInputs();
		});
	}
	
	intentionalClick() {
		this._controllers.forEach(controller => {
			controller.onclick();
		});
	}
	
	update() {
		this._boardGraphics.update();
	}
	
	makeMove(move) {
		super.makeMove(move);
		// TODO: tell graphics to move piece
		this.boardGraphics().makeMove(move, true);
	}
}

//class LocalChessGame extends GraphicalChessGame {
//	constructor(n) {
//		super(n);
//		this._rayCaster = null;
//		this.controllers = [ // TODO: assign teams dynamically...
////			new LocalPlayer3D(this, ChessGame.OMNISCIENT), 
//			new LocalPlayer3D(this, ChessGame.OMNISCIENT)
//		];
//	}
//	
//	keyInputs() {
//		this.controllers.forEach(controller => {
//			controller.keyInputs();
//		});
//	}
//	
//	intentionalClick() {
//		this.controllers.forEach(controller => {
//			controller.onclick();
//		});
//	}
//}

class OnlineChessGame extends GraphicalChessGame /* Implements Online */ {
	constructor(n) {
		super(n);
		
		this.controllers = [new OnlinePlayer3D(this), new MoveTransmitter(this)];
	}
}


class ChessTeam {
	constructor() {
		this.permissions = new Map();
	}
	
	setPermissions(whitePerms, blackPerms, ghostPerms) {
		this.permissions.set(ChessGame.WHITE, whitePerms);
		this.permissions.set(ChessGame.BLACK, blackPerms);
		this.permissions.set(ChessGame.GHOST, ghostPerms);
	}
}

ChessGame.GHOST = new ChessTeam();
ChessGame.NONE = new ChessTeam(); // TODO: may be problematic since spectator team is NONE and empty piece team is NONE
ChessGame.WHITE = new ChessTeam();
ChessGame.BLACK = new ChessTeam();
ChessGame.OMNISCIENT = new ChessTeam();

ChessGame.GHOST.setPermissions(false, false, true);
ChessGame.WHITE.setPermissions(true, false, false);
ChessGame.BLACK.setPermissions(false, true, false);
ChessGame.OMNISCIENT.setPermissions(true, true, false);

ChessGame.TIE_GAME = 2;

export default ChessGame;
export { GraphicalChessGame };