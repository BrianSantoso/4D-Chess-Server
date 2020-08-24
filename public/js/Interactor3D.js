import ChessGame from "./ChessGame.js";

class Interactor3D {
	constructor(team, chessGame, rayCaster) {
		this._movePreviewer = new MovePreviewer(ChessGame.OMNISCIENT, chessGame, rayCaster);
		this._pieceSelector = new PieceSelector(team, chessGame, rayCaster);
		this._moveConfirmer = new MoveConfirmer(ChessGame.GHOST, chessGame, rayCaster);
		this._rayCaster = rayCaster;
		
		this._unselected = () => {
			this._movePreviewer.update();
			this._pieceSelector.update();
			this._moveConfirmer.update();
		}
		this._selected = () => {
			this._pieceSelector.update();
			this._moveConfirmer.update();
		}
		
		this._state = this._unselected;
	}
	
	setRayCaster(rayCaster) {
		[this._movePreviewer, this._pieceSelector, this._moveConfirmer].forEach(component => {
			component.setRayCaster(rayCaster);
		});
	}
	
	intentionalClick(event) {
		if (this._pieceSelector.canClick()) {
			let selected = this._pieceSelector.onclick();
			if (selected) {
				this._state = this._selected;
			} else {
				this._state = this._unselected;
			}
		}
		this._moveConfirmer.onclick();
	}
	
	update() {
		this._state();
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
//			console.log('showing', mesh)
			let piece = mesh.piece;
			let moves = this._getPossibleMoves(piece);
			this._boardGraphics().showPossibleMoves(piece, moves, preview, 12);
		}
	}
	
	_hidePossibleMoves(mesh) {
		if (this._isPiece(mesh)) {
//			console.log('hiding', mesh)
			let piece = mesh.piece;
			this._boardGraphics().hidePossibleMoves(piece, 12);
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

class PieceSelector extends Interactor3DWorker /* Implements Clicker */ {
	update() {
		let prevHovering = this._getHovering();
		let hovering = this._rayCast();
		this._setHovering(hovering);
	}
	
	canClick() {
		return this._team === this._game.currTurn();
	}
	
	onclick() {
		let prevSelected = this._getSelected();
		let different = this._setSelected(this._getHovering());
		
		if (this._getSelected()) {
			if (different) {
				this._hidePossibleMoves(prevSelected);
				this._hidePossibleMoves(this._getSelected());
				this._showPossibleMoves(this._getSelected());
			} else {
				
			}
			
//			this._hidePossibleMoves(this._getSelected());
//			this._showPossibleMoves(this._getSelected());
			return true;
		} else {
			this._hidePossibleMoves(prevSelected);
			return false;
		}
	}
}

class MoveConfirmer extends Interactor3DWorker /* Implements Clicker */ {
	update() {
		let prevHovering = this._getHovering();
		let hovering = this._rayCast();
		this._setHovering(hovering);
	}
	
	canClick() {
		return this._team === this._game.currTurn();
	}
	
	onclick() {
		if (this._isGhost(this._getHovering())) {
			this._offerMove(this._getHovering().move);
//			this._setHovering(null);
		}
	}
	
	_offerMove(move) {
		// TODO: change
		this._game.makeMove(move);
	}
}

export default Interactor3D;
