import GameBoard from "./GameBoard.js";
import MoveHistory from "./MoveHistory.js";
import ChessTeam from "./ChessTeam.js";
import config from "./config.json";

class ChessGame {	
	constructor() {
		// We want to leave some fields undefined because if we create a ChessGame without
		// assigning Players, GameBoard, BoardGraphics, those undefined fields will not
		// override a templated (A game with those aforementioned fields specified) 
		// game's config
		this._board;
		this._white;
		this._black;
		this._boardGraphics;
		this._turn = ChessTeam.WHITE;
		// Why not just have subclasses of GameBoard override rules
		// for custom gamemodes (freeplay, etc.)?
		// A: May want to switch game modes once game ends.
		// this._mode = null;
		this._moveHistory = new MoveHistory();
		this._allPossibleMoves;
		this._status;

		// if (this._board.initialized()) {
		// 	this.status(); // computes board status and allPossibleMoves
		// }
	}

	toJSON() {
		return {
			_board: this._board,
			_turn: this._turn,
			_moveHistory: this._moveHistory,
			_status: this._status
		};
	}
	
	getPlayers() {
		return [this._white, this._black];
	}

	setBoard(board) {
		this._board = board;
		this.status(); // computes board status and allPossibleMoves
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
		let oppositeTeam = ChessTeam.oppositeTeam(turnEndTeam);
		let board = this.board();

		let allMoves = board.getAllPossibleMoves(oppositeTeam);
		let hasMoves = allMoves.length > 0;
		if (hasMoves) {
			this._status = ChessTeam.ONGOING;
		} else {
			let attacking = board.inCheck(oppositeTeam).length > 0;
			if (attacking) {
				this._status = turnEndTeam;
			} else {
				this._status = ChessTeam.TIE;
			}
		}
		console.log('[ChessGame] Status recomputed')
		this._allPossibleMoves = allMoves;
		return this._status;
	}

	allPossibleMoves() {
		if (this._allPossibleMoves) {
			return this._allPossibleMoves;
		}

		this._clearStatus();
		this.status();

		return this._allPossibleMoves;
	}

	inCheck(team) {
		return this.board().inCheck(team);
	}

	isLegal(move) {
		return this.board().isLegal(move);
	}

	_clearStatus() {
		this._allPossibleMoves = null;
		this._status = null;
	}

	isGameOver() {
		let status = this.status();
		return status.hasPermissions(ChessTeam.WHITE) || status.hasPermissions(ChessTeam.BLACK);
	}
	
	setBoardGraphics(boardGraphics) {
		this._boardGraphics = boardGraphics;
		// this._boardGraphics.spawnPieces(this._board.getPieces());
		
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
		
		this._board.makeMove(move); // update state
		this._boardGraphics.makeMove(move, config.animFrames.move); // animate
		
		this._clearStatus(); // reset gameover status
		let status = this.status(); // recalculate status
		this._moveHistory.add(move, status, this._allPossibleMoves); // add to history

		// implicitly recalculates status if needed
		if (this.isGameOver()) {

		} else {
			this._switchTurns();
		}
	}

	redo() {
		if (!this._boardGraphics._canInteract) {
			// Temporary fix. Make animator able to queue items
			return;
		}
		let redoData = this._moveHistory.redo();
		if (redoData) {
			let moveToRedo = redoData.move;
			let statusToRestore = redoData.status;
			let allPossibleMovesToRestore = redoData.allPossibleMoves;
			this._board.redoMove(moveToRedo);
			this._boardGraphics.makeMove(moveToRedo, config.animFrames.move);
			this._status = statusToRestore;
			this._allPossibleMoves = allPossibleMovesToRestore;
			this._switchTurns();
		}
	}

	undo() {
		if (!this._boardGraphics._canInteract) {
			// Temporary fix. Make animator able to queue items
			return;
		}
		let undoData = this._moveHistory.undo();
		if (undoData) {
			let moveToUndo = undoData.move;
			let statusToRestore = undoData.status;
			let allPossibleMovesToRestore = undoData.allPossibleMoves;
			this._board.undoMove(moveToUndo);
			this._boardGraphics.undoMove(moveToUndo, config.animFrames.move);
			this._status = statusToRestore;
			this._allPossibleMoves = allPossibleMovesToRestore;
			// this._clearStatus(); // reset gameover status
			// this.status();
			this._switchTurns();
		} else {
			
		}
	}
	
	assignRoles() {
		
	}
	
	getPossibleMoves(id, legalOnly=true) {
		let piece = this._board.getById(id);
		// TODO: interact with mode to determine altered possible moves
		return this._board.getPossibleMoves(piece.x, piece.y, piece.z, piece.w, legalOnly);
	}
	
	_getCurrentPlayer() {
		if (this._turn === ChessTeam.WHITE) {
			return this._white;
		} else if (this._turn === ChessTeam.BLACK) {
			return this._black;
		} else {
			return null; // TODO: not sure what to return (ghost, none?)
		}
	}
	
	_switchTurns() {
		if (this._turn === ChessTeam.WHITE) {
			this._turn = ChessTeam.BLACK;
		} else if (this._turn === ChessTeam.BLACK) {
			this._turn = ChessTeam.WHITE;
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

	// restoreFrom(fields) {
	// 	Object.assign(this, ChessGame.revive(fields));
	// 	this.allPossibleMoves();
	// }
	view3D() {
		return this._boardGraphics.view3D();
	}
}

ChessGame.create = (options) => {
	// Factory to create game, instantiating and injecting required dependencies
	let game = new ChessGame();
	let board = GameBoard.create(options.dim);
	game.setBoard(board);
	
	let boardGraphics = new options.BoardGraphics(options.dim);
	game.setBoardGraphics(boardGraphics);
	
	let white = new options.WhitePlayer(ChessTeam.WHITE, game);
	let black = new options.BlackPlayer(ChessTeam.BLACK, game);
	game.setWhite(white);
	game.setBlack(black);
	
	return game;
};

ChessGame.revive = (fields) => {
	return Object.assign(new ChessGame(), fields, {
		_board: GameBoard.revive(fields._board),
		_turn: ChessTeam.revive(fields._turn),
		_moveHistory: MoveHistory.revive(fields._moveHistory),
		_status: ChessTeam.revive(fields._status)
	});
};

export default ChessGame;