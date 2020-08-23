import ChessGame from "./ChessGame.js";

class Interactor3D {
	constructor(team, chessGame, rayCaster) {
		this._movePreviewer = new MovePreviewer(ChessGame.OMNISCIENT, chessGame, rayCaster);
		this._pieceSelector = new PieceSelector(team, chessGame, rayCaster);
		this._moveConfirmer = new PieceSelector(ChessGame.GHOST, chessGame, rayCaster);
		this._rayCaster = rayCaster;
	}
	
	setRayCaster(rayCaster) {
		[this._movePreviewer, this._pieceSelector, this._moveConfirmer].forEach(component => {
			component.setRayCaster(rayCaster);
		});
	}
	
	intentionalClick(event) {
		
	}
	
	update() {
		this._movePreviewer.update();
		// TODO: offer moves
	}
}

class Interactor3DWorker {
	constructor(team, chessGame, rayCaster) {
		this._hovering = null;
		this._selected = null;
		this._rayCaster = rayCaster;
		this._showingMovesFor = new Map();
		
		this._team = team;
		this._game = chessGame;
	}
	
	update() {
		
	}
	
	setRayCaster(rayCaster) {
		this._rayCaster = rayCaster;
	}
	
	_setHovering(mesh) {
		let different = this._hovering !== mesh;
		this._hovering = mesh;
		return different;
	}
	
	_setSelected(mesh) {
		let different = this._selected !== mesh;
		this._selected = mesh;
		return different;
	}
	
	_getHovering() {
		return this._hovering;
	}
	
	_getSelected() {
		return this._selected;
	}
	
	_getPossibleMoves(piece) {
		return this._game.getPossibleMoves(piece);
	}
	
	_boardGraphics() {
		return this._game.boardGraphics();
	}
	
	_showPossibleMoves(mesh, preview=false) {
		if (this._isPiece(mesh)) {
			console.log('showing', mesh)
			let piece = mesh.piece;
			let moves = this._getPossibleMoves(piece);
			this._boardGraphics().showPossibleMoves(piece, moves, preview, 120);
		}
	}
	
	_hidePossibleMoves(mesh) {
		if (this._isPiece(mesh)) {
			console.log('hiding', mesh)
			let piece = mesh.piece;
			this._boardGraphics().hidePossibleMoves(piece, 120);
		}
	}
	
	_isPiece(mesh) {
		return mesh && !!mesh.piece;
	}
	
	_isGhost(mesh) {
		return mesh && !!mesh.move;
	}
	
	_rayCast() {
		return this._boardGraphics().rayCast(this._rayCaster, this._team);
	}
}

class MovePreviewer extends Interactor3DWorker {
	update() {
		let prevHovering = this._getHovering();
		let hovering = this._rayCast();
		let different = this._setHovering(hovering);
		
		if (different) {
			this._hidePossibleMoves(prevHovering);
			this._showPossibleMoves(hovering);
		}
	}
	
	_showPossibleMoves(mesh) {
		super._showPossibleMoves(mesh, true);
	}
}

class PieceSelector extends Interactor3DWorker {
	
}

class MoveConfirmer extends Interactor3DWorker {
	
}

export default Interactor3D;
