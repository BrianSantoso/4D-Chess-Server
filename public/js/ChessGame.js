import GameBoard from "./GameBoard.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";
import Piece from "./Piece.js";
import { LocalPlayer3D, OnlinePlayer3D } from "./ChessPlayer.js";

class ChessGame {	
	constructor(dim) {
		this._board = new GameBoard(dim);
		this._white = null;
		this._black = null;
		this._boardGraphics = null;
		this._turn = ChessGame.WHITE;
		// Why not just have subclasses of GameBoard override rules
		// for custom gamemodes (freeplay, etc.)?
		// A: May want to switch game modes once game ends.
		this._mode = null;
		this._moveHistory = []; // TODO: doubly linked list of moves
		this._status = ChessGame.ONGOING; // Initial board state is assumed to be not game-ending to prevent double computation on first turn. Ideally should be null.
		this._gameOver = false;
	}
	
	getPlayers() {
		return [this._white, this._black];
	}
	
	setWhite(player) {
		this._white = player;
	}
	
	setBlack(player) {
		this._black = player;
	}

	status() {
		// TODO: Cache status to prevent redundant computation
		if (this._status) {
			return this._status;
		}

		let turnEndTeam = this.currTurn();
		let oppositeTeam = ChessGame.oppositeTeam(turnEndTeam);
		let board = this.board();

		let allMoves = board.getAllPossibleMoves(oppositeTeam);
		let hasMoves = allMoves.length > 0;
		if (hasMoves) {
			this._status = ChessGame.ONGOING;
		} else {
			let attacking = board.inCheck(oppositeTeam).length > 0;
			if (attacking) {
				this._status = turnEndTeam;
			} else {
				this._status = ChessGame.TIE;
			}
		}
		console.log('Status recomputed')
		return this._status;
	}

	inCheck(team) {
		return this.board().inCheck(team);
	}

	_clearStatus() {
		this._status = null;
	}

	isGameOver() {
		let status = this.status();
		return status.hasPermissions(ChessGame.WHITE) || status.hasPermissions(ChessGame.BLACK);
	}
	
	setBoardGraphics(boardGraphics) {
		this._boardGraphics = boardGraphics;
		this._boardGraphics.spawnPieces(this._board.getPieces());
		
		// Managing these dependencies is cumbersome, so for the sake
		// of simplicity I am willing to compromise the fact that
		// ChessPlayers get their boardGraphics through chessGame,
		// instead of directly through a boardGraphics reference
//		this.getPlayers().forEach(player => player.setBoardGraphics(boardGraphics));
	}
	
	boardGraphics() {
		return this._boardGraphics;
	}

	board() {
		return this._board;
	}
	
	makeMove(move) {
		if (this.isGameOver()) {
			return;
		}
		
		this._board.makeMove(move);
		this._boardGraphics.makeMove(move, 24);
		this._clearStatus();
		// add move to history

		if (this.isGameOver()) {
			let status = this.status();
		} else {
			this._switchTurns();
		}
	}
	
	assignRoles() {
		
	}
	
	getPossibleMoves(piece, legalOnly=true) {
		// TODO: interact with mode to determine altered possible moves
		return this._board.getPossibleMoves(piece.x, piece.y, piece.z, piece.w, legalOnly);
	}
	
	_getCurrentPlayer() {
		if (this._turn === ChessGame.WHITE) {
			return this._white;
		} else if (this._turn === ChessGame.BLACK) {
			return this._black;
		} else {
			return null; // TODO: not sure what to return (ghost, none?)
		}
	}
	
	_switchTurns() {
		if (this._turn === ChessGame.WHITE) {
			this._turn = ChessGame.BLACK;
		} else if (this._turn === ChessGame.BLACK) {
			this._turn = ChessGame.WHITE;
		}
	}
	
	update() {
		this._getCurrentPlayer().update(); // TODO: separate into keyInputs and update?
		this._boardGraphics.update();
//		this.getPlayers().forEach(player => {
//			player.update(); // Query players for a move
//		});
//		this._getCurrentPlayer().update();
	}
	
	currTurn() {
		return this._turn;
	}
}

//class GraphicalChessGame extends ChessGame {
//	constructor(n) {
//		super(n);
//		
//		this._rayCaster = null;
//		this._controllers = [ // TODO: assign teams dynamically...
//			new LocalPlayer3D(this, ChessGame.OMNISCIENT)
//		];
//		this._boardGraphics = new BoardGraphics(n); // 3D View
//		this._layerStack; // 2D View
//	}
//	
//	initGraphics() {
//		this._boardGraphics.spawnPieces(this._board.getPieces());
//	}
//	
//	setRayCaster(rayCaster) {
//		this._rayCaster = rayCaster;
//	}
//	
//	showPossibleMoves(piece) {
//		let moves = this.board().getPossibleMoves(piece.x, piece.y, piece.z, piece.w);
//		this.boardGraphics().showPossibleMoves(piece, moves);
//	}
//	
//	previewPossibleMoves(piece) {
//		let moves = this.board().getPossibleMoves(piece.x, piece.y, piece.z, piece.w);
//		this.boardGraphics().previewPossibleMoves(piece, moves);
//	}
//	
//	hidePossibleMoves() {
//		this.boardGraphics().hidePossibleMoves();
//	}
//	
//	rayCast(targetTeam) {
//		return this.boardGraphics().rayCast(this._rayCaster, targetTeam);
//	}
//	
//	boardGraphics() {
//		return this._boardGraphics;
//	}
//	
//	view3D() {
//		return this.boardGraphics().view3D();
//	}
//	
//	keyInputs() {
//		this._controllers.forEach(controller => {
//			controller.keyInputs();
//		});
//	}
//	
//	intentionalClick() {
//		this._controllers.forEach(controller => {
//			controller.onclick();
//		});
//	}
//	
//	update() {
//		this._boardGraphics.update();
//	}
//	
//	makeMove(move) {
//		super.makeMove(move);
//		// TODO: tell graphics to move piece
//		this.boardGraphics().makeMove(move, true);
//	}
//}

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

//class OnlineChessGame extends GraphicalChessGame /* Implements Online */ {
//	constructor(n) {
//		super(n);
//		
//		this.controllers = [new OnlinePlayer3D(this), new MoveTransmitter(this)];
//	}
//}


class ChessTeam {
	constructor() {
		this.permissions = new Map();
	}
	
	setPermissions(whitePerms, blackPerms, ghostPerms) {
		this.permissions.set(ChessGame.WHITE, whitePerms);
		this.permissions.set(ChessGame.BLACK, blackPerms);
		this.permissions.set(ChessGame.GHOST, ghostPerms);
	}

	hasPermissions(team) {
		return this.permissions.get(team);
	}
}

ChessGame.GHOST = new ChessTeam();
ChessGame.NONE = new ChessTeam(); // TODO: may be problematic since spectator team is NONE and empty piece team is NONE
ChessGame.WHITE = new ChessTeam();
ChessGame.BLACK = new ChessTeam();
ChessGame.OMNISCIENT = new ChessTeam();
ChessGame.TIE = ChessGame.OMNISCIENT;
ChessGame.ONGOING = ChessGame.NONE;

ChessGame.NONE.setPermissions(false, false, false);
ChessGame.GHOST.setPermissions(false, false, true);
ChessGame.WHITE.setPermissions(true, false, false);
ChessGame.BLACK.setPermissions(false, true, false);
ChessGame.OMNISCIENT.setPermissions(true, true, false);

ChessGame.oppositeTeam = (team) => {
	if (team === ChessGame.WHITE) {
		return ChessGame.BLACK;
	} else if (team === ChessGame.BLACK) {
		return ChessGame.WHITE;
	} else {
		return null;
	}
};

export default ChessGame;