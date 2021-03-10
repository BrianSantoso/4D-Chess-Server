import GameBoard from "./GameBoard.js";
import MoveHistory from "./MoveHistory.js";
import ChessTeam, { ChessStatus } from "./ChessTeam.js";
import config from "./config.json";
import Player from "./ChessPlayer.js";
import Move from "./Move.js";
import RoomData from "./RoomData.js";
import { Room } from "colyseus.js";
import { mergeWith } from "lodash";
import TimeControl from "./TimeControl.js";

export const deepMerge = (a, b) => {
	return mergeWith(a, b, (c, d) => {
		// instanceof Object would cause infinite loop for 
		// case where nested object and and its parent
		// have references to each other
		if (c instanceof RoomData || d instanceof RoomData) {
			return deepMerge(c, d);
		}
	});
}

class ChessGame {
	constructor() {
		// We want to leave some fields undefined so that if we create a ChessGame without
		// assigning Players, GameBoard, BoardGraphics, those undefined fields will NOT
		// override a templated game's (A game with those aforementioned fields specified) 
		// config when merging via Object.assign(template, gameWithSomeEmptyFields)
		this._mode;
		this._board;
		this._white = Player.create(ChessGame.WHITE);
		this._black = Player.create(ChessGame.BLACK);
		this._needsValidation = true;
		this._boardGraphics;
		this._timeControl;
		this._gui;

		this._moveHistory = new MoveHistory();

		this._gameManager;
		this._room;

		this._roomData = new RoomData();

		this._cachedStatus = null;
		this._gameOver = false;
	}

	toJSON() {
		return {
			_mode: this._mode,
			_board: this._board,
			_moveHistory: this._moveHistory,
			_white: this._white,
			_black: this._black,
			_gameOver: this._gameOver,
			_roomData: this._roomData,
			_timeControl: this._timeControl
		};
	}

	setNeedsValidation(bool) {
		this._needsValidation = bool;
	}
	
	hasBegun() {
		return this._moveHistory.length() >= 2;
	}

	getPlayers() {
		return [this._white, this._black];
	}

	setBoard(board) {
		this._board = board;
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
		if (this._cachedStatus) {
			return this._cachedStatus;
		}

		let board = this.board();
		let currTeam = this.viewingTurn();
		let hasNoMoves = board.hasNoMoves(currTeam);
		let attacked = this.inCheck(currTeam).length > 0;
		let status;
		if (hasNoMoves) {
			if (attacked) {
				status = currTeam.lose();
			} else {
				status = ChessStatus.STALEMATE;
			}
		} else {
			if (attacked) {
				status = currTeam.attacked();
			} else {
				status = currTeam.myTurn();
			}
		}
		this._cachedStatus = status;
		return status;
	}

	validate(move) {
		if (!this._needsValidation) {
			return true;
		}
		// TODO: Check not game over and is legal
		// TODO: Check that it is the correct team!
		let legalMoves = this.getPossibleMoves(move.pieceId);
		let inLegalMoves = legalMoves.some(possibleMove => Move.isEqual(possibleMove, move));
		if (inLegalMoves) {
			return true;
		} else {
			throw new Error("Invalid move", move);
		}
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
	
	setBoardGraphics(boardGraphics) {
		this._boardGraphics = boardGraphics;
	}

	initBoardGraphics() {
		this._boardGraphics.init(this._board.dims());
		this._boardGraphics.spawnPieces(this._board.getPieces(), this._board.allPieces());
	}

	initGUI() {
		this._gui = this._gameManager.createGUI(this._mode);
		this._gui.setGame(this);
	}

	setManager(gameManager) {
		this._gameManager = gameManager;
	}
	
	boardGraphics() {
		return this._boardGraphics;
	}

	board() {
		return this._board;
	}

	syncMoveData(moveData) {
		return this._mode.syncMoveData.call(this, moveData)
	}
	
	makeMove(move, time, timestamp) {
		this.update();
		return this._mode.makeMove.call(this, move, time, timestamp);
	}

	redo() {
		if (!this._boardGraphics.canInteract()) {
			// Temporary fix. Make animator able to queue items
			return;
		}
		let redoData = this._moveHistory.next(); // Do not move index immediately, status calculation depends on team, which depends on index
		if (redoData) {
			let move = redoData.move;
			this.validate(move);
			this._board.redoMove(move);
			this._boardGraphics.makeMove(move, config.animFrames.move);
			this._moveHistory.redo();
			this.turnChange();
		}
	}

	undo() {
		if (!this._boardGraphics.canInteract()) {
			// Temporary fix. Make animator able to queue items
			return;
		}
		let undoData = this._moveHistory.undo();
		if (undoData) {
			let move = undoData.move;
			this._board.undoMove(move);
			this._boardGraphics.undoMove(move, config.animFrames.move);
			this.turnChange();
		}
	}

	turnChange() {
		this._cachedStatus = null;

		if (!this._gameOver) {
			let status = this.status();
			console.log('Status:', status);
			if (status.isTerminating()) {
				this._gameOver = true;
			}
		}
	}

	gameOver() {
		return this._gameOver;
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
	
	viewingTurn() {
		return this._moveHistory.viewingTurn();
	}

	currTurn() {
		return this._moveHistory.currTurn();
	}

	view3D() {
		return this._boardGraphics.view3D();
	}

	view2D() {
		return this._gui.view2D();
	}

	setRoom(room, configureMessageHandlers) {
		configureMessageHandlers.call(this);
		this._roomData.setRoom(room);
	}

	sendMessage(type, message) {
		this._roomData.send(type, message);
	}

	setMode(mode) {
		this._mode = mode;
	}

	setPlayerControls(controllerTypes) { // returns true if any types were changed
		this._white.to(controllerTypes.white);
		this._black.to(controllerTypes.black);
	}

	getRoomData() {
		return this._roomData;
	}

	getTeam(id) {
		return this._roomData.getTeam(id);
	}

	getRole(id) {
		return this._roomData.getRole(id);
	}

	getMode() {
		return this._mode;
	}

	setTimeControl(timeControl) {
		this._timeControl = timeControl;
	}

	chatMsg(message) {
		this._gui.chatMsg(message);
	}

	getStatusMessage() {
		return this._mode.getStatusMessage.call(this);
	}

	getTimeTeam(team) {
		let lastMoveData = this._moveHistory.getLastMoveTeam(team);
        let whoseTurn = this.currTurn();
		
        let timeLeftOfLastMove, timestampOfLastMove;
        if (lastMoveData) {
            timeLeftOfLastMove = lastMoveData.time;
			if (whoseTurn === team) {
				timestampOfLastMove = lastMoveData.timestamp;
			} else {
				timestampOfLastMove = Date.now();
			}
        } else {
            timestampOfLastMove = Date.now();
            if (whoseTurn === ChessTeam.WHITE) {
                timeLeftOfLastMove = this._timeControl._whiteStartTime;
            } else {
                timeLeftOfLastMove = this._timeControl._blackStartTime;
            }
        }
        let curr = timeLeftOfLastMove - (Date.now() - timestampOfLastMove);
		return curr;
	}

	syncRoomData(roomData) {
		console.log('Aplying roomData patch using', roomData);
		deepMerge(this._roomData, roomData);
	}
}

ChessGame.create = (options) => {
	// Factory to create game, instantiating and injecting required dependencies
	let game = new ChessGame();
	let board = GameBoard.create(options.boardConfig);
	game.setBoard(board);
	
	let boardGraphics = new options.BoardGraphics();
	game.setBoardGraphics(boardGraphics);
	
	// let white = new options.WhitePlayer(ChessTeam.WHITE, game);
	// let black = new options.BlackPlayer(ChessTeam.BLACK, game);
	let white = Player.create(ChessTeam.WHITE, game, options.whitePlayerType, {});
	let black = Player.create(ChessTeam.BLACK, game, options.blackPlayerType, {});
	game.setWhite(white);
	game.setBlack(black);
	
	game.setMode(options.mode);

	if (options.timeControl) { // Example: when ClientGameManager creates template, timeControl is not specified
		let timeControl = TimeControl.revive(options.timeControl);
		game.setTimeControl(timeControl);
	}
	return game;
};

ChessGame.revive = (fields) => {
	console.log('Reviving game from:', fields)
	let game = new ChessGame();
	return Object.assign(game, fields, {
		_mode: ChessMode.revive(fields._mode),
		_board: GameBoard.revive(fields._board),
		_moveHistory: MoveHistory.revive(fields._moveHistory),
		_white: fields._white, // this is just an Object.assign call
		_black: fields._black,
		_roomData: RoomData.revive(fields._roomData),
		_timeControl: TimeControl.revive(fields._timeControl)
	});
};

class ChessMode {
	constructor(type, update, syncMoveData, makeMove, setPlayerControls, getStatusMessage) {
		this.type = type;
		this.update = update;
		this.syncMoveData = syncMoveData;
		this.makeMove = makeMove;
		this.setPlayerControls = setPlayerControls;
		this.getStatusMessage = getStatusMessage;
	}

	toJSON() {
		return this.type;
	}
}

ChessMode.TEMPLATE = new ChessMode('TEMPLATE', () => {}, () => {}, () => {});

// ChessMode.LOCAL_MULTIPLAYER = new ChessMode('LOCAL_MULTIPLAYER', 
// 	function update(timeOfLastMove, timestampOfLastMove, hasBegun) {
// 		let playerCanInteract = true;
// 		this._getCurrentPlayer().update(timeOfLastMove, timestampOfLastMove, playerCanInteract, hasBegun);
// 		this._boardGraphics.update();
// 	}, 
// 	function makeMove(move) {
// 		// TODO: rewrite, following online_multiplayer
// 		if (this.isGameOver()) {
// 			return;
// 		}
		
// 		this._board.makeMove(move); // update state
// 		this._boardGraphics.makeMove(move, config.animFrames.move); // animate
// 		let allPossibleMoves = this.allPossibleMoves();
// 		this._clearStatus(); // reset gameover status
// 		let status = this.status(); // recalculate status
// 		let time = this._getCurrentPlayer().getTime();
// 		this._moveHistory.add(move, time); // add to history

// 		// implicitly recalculates status if needed
// 		if (this.isGameOver()) {

// 		} else {
// 			// this._switchTurns();
// 		}
// 	},
// 	function setPlayerControls(clientTeam) {
// 		this._white.to('LocalPlayer3D');
// 		this._black.to('LocalPlayer3D');
// 	}
// );

ChessMode.ONLINE_MULTIPLAYER = new ChessMode('ONLINE_MULTIPLAYER', 
	function update(timeOfLastMove, timestampOfLastMove, hasBegun) {
		let playerCanInteract = this._moveHistory.atLast();
		this._getCurrentPlayer().update(timeOfLastMove, timestampOfLastMove, hasBegun, playerCanInteract); // TODO: determine better way to disable interaction
		this._boardGraphics.update();
		if (this._gui) { // TODO: create empty gui for server so we can get rid of this if statement
			this._gui.update();
		}
	},
	function syncMoveData(moveData) {
		this._moveHistory.syncMoveData(moveData)
	},
	function makeMove(move) {		
		// time and timestamp are optional parameters 
		let time = this.getTimeTeam(this.currTurn());
		let moveData;
		if (this._moveHistory.atLast()) {
			this.validate(move);
			 // update state and animate
			this._board.makeMove(move);
			this._boardGraphics.makeMove(move, config.animFrames.move);
			// add to history
			moveData = this._moveHistory.add(move, time);

			this.turnChange();
		} else {
			// If receiving a move while viewing past history
			moveData = this._moveHistory.addToEnd(move, time); // add to history
			this.turnChange();
		}
		return moveData;
	},
	function getStatusMessage() {
		let status = this.status();
		if (this._moveHistory.atLast()) {
			return status.getMessage();
		} else {
			return `Viewing turn ${this._moveHistory.englishViewingTurnNum()}`;
		}
	}
);

ChessMode.revive = (type) => {
    return ChessMode[type];
};

export default ChessGame;
export { ChessMode };