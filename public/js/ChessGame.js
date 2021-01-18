import GameBoard from "./GameBoard.js";
import MoveHistory from "./MoveHistory.js";
import ChessTeam from "./ChessTeam.js";
import config from "./config.json";
import Player from "./ChessPlayer.js";

class ChessGame {
	constructor() {
		// We want to leave some fields undefined because if we create a ChessGame without
		// assigning Players, GameBoard, BoardGraphics, those undefined fields will not
		// override a templated gam,e's (A game with those aforementioned fields specified) 
		// config when merging via Object.assign(template, gameWithSomeEmptyFields)
		this._mode;
		this._board;
		this._white = Player.create(ChessGame.WHITE);
		this._black = Player.create(ChessGame.BLACK);
		this._boardGraphics;
		// this._turn = ChessTeam.WHITE;

		this._moveHistory = new MoveHistory();
		this._allPossibleMoves;
		this._status;

		this._room;
	}

	toJSON() {
		return {
			_mode: this._mode,
			_board: this._board,
			// _turn: this._turn,
			_moveHistory: this._moveHistory,
			_status: this._status,
			_white: this._white,
			_black: this._black
		};
	}
	
	hasBegun() {
		return this._moveHistory.length() >= 2;
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

	getWhite() {
		return this._white;
	}

	getBlack() {
		return this._black;
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

	isBlocked(pieceToMoveId, pieceToCaptureId) {
		let pieceToMove = this._board.getById(pieceToMoveId);
		let pieceToCapture = this._board.getById(pieceToCaptureId);
		return this.board().isBlocked(pieceToMove, pieceToCapture);
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
		this.update();
		this._mode.makeMove.call(this, move);
	}

	redo() {
		if (!this._boardGraphics.canInteract()) {
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

			if (statusToRestore && allPossibleMovesToRestore) {
				// if memoized info is availlable, used that, otherwise compute manually
				// TODO: potential for bugs
				this._status = statusToRestore;
				this._allPossibleMoves = allPossibleMovesToRestore;
			} else {
				this._clearStatus();
				this.status();
				redoData.status = this._status;
				redoData.allPossibleMoves = this._allPossibleMoves;
			}
			
			// this._switchTurns();
		}
	}

	undo() {
		if (!this._boardGraphics.canInteract()) {
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

			if (statusToRestore && allPossibleMovesToRestore) {
				// if memoized info is availlable, used that, otherwise compute manually
				// TODO: potential for bugs
				this._status = statusToRestore;
				this._allPossibleMoves = allPossibleMovesToRestore;
			} else {
				this._clearStatus();
				this.status();
				undoData.status = this._status;
				undoData.allPossibleMoves = this._allPossibleMoves;
			}

			// this._switchTurns();
		}
	}
	
	getPossibleMoves(id, legalOnly=true) {
		let piece = this._board.getById(id);
		// TODO: interact with mode to determine altered possible moves
		return this._board.getPossibleMoves(piece.x, piece.y, piece.z, piece.w, legalOnly);
	}
	
	_getCurrentPlayer() {
		let currTurn = this.currTurn();
		if (currTurn === ChessTeam.WHITE) {
			return this._white;
		} else if (currTurn === ChessTeam.BLACK) {
			return this._black;
		} else {
			return null; // TODO: not sure what to return (ghost, none?)
		}
	}
	
	// _switchTurns() {
	// 	if (this._turn === ChessTeam.WHITE) {
	// 		this._turn = ChessTeam.BLACK;
	// 	} else if (this._turn === ChessTeam.BLACK) {
	// 		this._turn = ChessTeam.WHITE;
	// 	}
	// }
	
	update(step) {
		let timeOfLastMove = this._getCurrentPlayer().getTime();
		let timestampOfLastMove = new Date();
		let previousMove = this._moveHistory.get(this._moveHistory.length() - 2);
		if (previousMove) {
			timeOfLastMove = previousMove.time;
		}

		if (this._moveHistory.length() >= 4) {
			// First 2 moves don't contribute to calculation.
			timestampOfLastMove = previousMove.timestamp;
		} else {
			let opponentsMove = this._moveHistory.getLast();
			if (opponentsMove) {
				timestampOfLastMove = opponentsMove.timestamp;
			}
		}
		
		this._mode.update.call(this, timeOfLastMove, timestampOfLastMove, this.hasBegun());
	}
	
	currTurn() {
		return this._moveHistory.currTurn();
	}

	view3D() {
		return this._boardGraphics.view3D();
	}

	setRoom(room) {
		this._room = room;
	}

	sendMessage(type, message) {
		this._room.send(type, message);
	}

	setMode(mode) {
		this._mode = mode;
	}

	setPlayerData(playerData) {
		let whiteData = playerData._white;
		let blackData = playerData._black;
		this._white.setData(whiteData);
		this._black.setData(blackData);
	}

	setPlayerControls(clientTeam) {
		this._mode.setPlayerControls.call(this, clientTeam);
	}

	getPlayerData() {
		return {
			_white: this._white.toJSON(),
			_black: this._black.toJSON()
		}
	}
}

ChessGame.create = (options) => {
	// Factory to create game, instantiating and injecting required dependencies
	let game = new ChessGame();
	let board = GameBoard.create(options.dim);
	game.setBoard(board);
	
	let boardGraphics = new options.BoardGraphics(options.dim);
	game.setBoardGraphics(boardGraphics);
	
	// let white = new options.WhitePlayer(ChessTeam.WHITE, game);
	// let black = new options.BlackPlayer(ChessTeam.BLACK, game);
	let white = Player.create(ChessTeam.WHITE, game, options.whitePlayerType, {});
	let black = Player.create(ChessTeam.BLACK, game, options.blackPlayerType, {});
	game.setWhite(white);
	game.setBlack(black);
	
	game.setMode(options.mode);
	return game;
};

ChessGame.revive = (fields) => {
	console.log('Reviving game from:', fields)
	let game = new ChessGame();
	return Object.assign(game, fields, {
		_mode: ChessMode.revive(fields._mode),
		_board: GameBoard.revive(fields._board),
		// _turn: ChessTeam.revive(fields._turn),
		_moveHistory: MoveHistory.revive(fields._moveHistory),
		_status: ChessTeam.revive(fields._status),
		_white: fields._white, // this is just an Object.assign call
		_black: fields._black
	});
};

class ChessMode {
	constructor(type, update, makeMove, setPlayerControls) {
		this.type = type;
		this.update = update;
		this.makeMove = makeMove;
		this.setPlayerControls = setPlayerControls;
	}

	toJSON() {
		return this.type;
	}
}

ChessMode.TEMPLATE = new ChessMode('TEMPLATE', () => {}, () => {}, () => {});

ChessMode.LOCAL_MULTIPLAYER = new ChessMode('LOCAL_MULTIPLAYER', 
	function update(timeOfLastMove, timestampOfLastMove, hasBegun) {
		let playerCanInteract = true;
		this._getCurrentPlayer().update(timeOfLastMove, timestampOfLastMove, playerCanInteract, hasBegun);
		this._boardGraphics.update();
	}, 
	function makeMove(move) {
		if (this.isGameOver()) {
			return;
		}
		
		this._board.makeMove(move); // update state
		this._boardGraphics.makeMove(move, config.animFrames.move); // animate
		
		this._clearStatus(); // reset gameover status
		let status = this.status(); // recalculate status
		let time = this._getCurrentPlayer().getTime();
		this._moveHistory.add(move, time, status, this._allPossibleMoves); // add to history

		// implicitly recalculates status if needed
		if (this.isGameOver()) {

		} else {
			// this._switchTurns();
		}
	},
	function setPlayerControls(clientTeam) {
		this._white.to('LocalPlayer3D');
		this._black.to('LocalPlayer3D');
	}
);

ChessMode.ONLINE_MULTIPLAYER = new ChessMode('ONLINE_MULTIPLAYER', 
	function update(timeOfLastMove, timestampOfLastMove, hasBegun) {
		let playerCanInteract = this._moveHistory.atLast();
		this._getCurrentPlayer().update(timeOfLastMove, timestampOfLastMove, hasBegun, playerCanInteract); // TODO: determine better way to disable interaction
		this._boardGraphics.update();
	},
	function makeMove(move) {
		if (this.isGameOver()) {
			return;
		}
		let time = this._getCurrentPlayer().getTime();
		if (this._moveHistory.atLast()) {
			this._board.makeMove(move); // update state
			this._boardGraphics.makeMove(move, config.animFrames.move); // animate
			this._clearStatus(); // reset gameover status
			let status = this.status(); // recalculate status
			this._moveHistory.add(move, time, status, this._allPossibleMoves); // add to history
			// implicitly recalculates status if needed
			if (this.isGameOver()) {

			} else {
				// this._switchTurns();
			}
		} else {
			// TODO: status and allPossibleMoves will not be memoized
			this._moveHistory.addToEnd(move, time); // add to history
		}
	},
	function setPlayerControls(clientTeam) {
		if (clientTeam === ChessTeam.WHITE) {
			this._white.to('OnlinePlayer3D');
			this._black.to('AbstractPlayer3D');
		} else if (clientTeam === ChessTeam.BLACK) {
			this._white.to('AbstractPlayer3D');
			this._black.to('OnlinePlayer3D');
		} else {
			this._white.to('AbstractPlayer3D');
			this._black.to('AbstractPlayer3D');
		}
	}
);

ChessMode.revive = (type) => {
    return ChessMode[type];
};

export default ChessGame;
export { ChessMode };