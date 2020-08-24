import ChessGame from "./ChessGame.js";

class Interactor3D {
	constructor(team, chessGame, rayCaster) {
		this._team = team;
		this._game = chessGame;
		this._rayCaster = rayCaster;
		
		this._movePreviewer = new MovePreviewer(this, ChessGame.OMNISCIENT);
		this._pieceSelector = new PieceSelector(this, team);
		this._moveConfirmer = new MoveConfirmer(this, ChessGame.GHOST);
		
		// Define behavior for unselected state
		this._unselected = {
			update: () => {
				if (this._myTurn()) {
					this._movePreviewer.update();
					this._movePreviewer.showMovesFor(this._movePreviewer.hovering());
				}
				
				this._pieceSelector.update();
				// TODO: make _pieceSelector highlight hovering piece
			},
			onclick: () => {
				if (this._myTurn()) {
					this._pieceSelector.update(); // update _pieceSelector's hovering
					this._pieceSelector.select(); // set _pieceSelector's selected to its hovering
					if (this._pieceSelector.selected()) { // if clicked on a ghost piece
						// Hide _movePreviewer's moves
						this._movePreviewer.showMovesFor(null);
						// Show the moves for what was selected
						this._pieceSelector.showMovesFor(this._pieceSelector.selected());
						// TODO: make _pieceSelector highlight selected piece
						
						// Swap to selected state
						this.swapState(this._selected);
					}
				}
			},
			onSwapOut: () => {}
		};
		
		// Define behavior for selected state
		this._selected = {
			update: () => {
				this._moveConfirmer.update();
				// Can optinally do something more, like highlight the ghost move that is being hovering on.
			},
			onclick: () => {
				this._moveConfirmer.update();
				this._moveConfirmer.select();
				if (this._moveConfirmer.selected()) {
					let move = this._moveConfirmer.selected().move;
					this.offerMove(move);
				}
				this._moveConfirmer.setSelected(null);
				this._pieceSelector.setSelected(null);
				this._pieceSelector.showMovesFor(null);
				this.swapState(this._unselected);
			},
			onSwapOut: () => {}
		};
		
		this._state = this._unselected;
	}
	
	setRayCaster(rayCaster) {
		this._rayCaster = rayCaster;
	}
	
	intentionalClick(event) {
		this._state.onclick();
	}
	
	update() {
		this._state.update();
	}
	
	swapState(state) {
		this._state.onSwapOut();
		this._state = state;
	}
	
	boardGraphics() {
		return this._game.boardGraphics();
	}
	
	getPossibleMoves(piece) {
		return this._game.getPossibleMoves(piece);
	}
	
	rayCast(team) {
		team = team || this.team; // default to Interactor's team
		return this.boardGraphics().rayCast(this._rayCaster, team);
	}
	
	offerMove(move) {
		this._game.makeMove(move);
	}
	
	_myTurn() {
		return this._team === this._game.currTurn();
	}
}

Interactor3D.isPiece = function(mesh) {
	return mesh && !!mesh.piece;
}
	
Interactor3D.isGhost = function(mesh) {
	return mesh && !!mesh.move;
}

class Interactor3DWorker {
	constructor(parent, team) {
		this._parent = parent;
		this._team = team;
		
		this._hovering = null;
		this._selected = null;
		this._showingMovesFor = null;
	}
	
	update() {
		let hovering = this._rayCast();
		this._setHovering(hovering);
	}
	
	showMovesFor(mesh, preview=false) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
			if (this._showingMovesFor !== mesh) {
				// If different than already showing, hide previous and show new
				this._hidePossibleMoves(this._showingMovesFor);
				this._showPossibleMoves(mesh, preview);
			}
		} else {
			this._hidePossibleMoves(this._showingMovesFor);
		}
		this._showingMovesFor = mesh;
	}
	
	hovering() {
		return this._hovering;
	}
	
	select() {
		// Set selected to hovering (requires updating hovering through update())
		this.setSelected(this._hovering);
	}
	
	selected() {
		return this._selected;
	}
	
	_rayCast() {
		return this._parent.rayCast(this._team);
	}
	
	_setHovering(mesh) {
		let different = this._hovering !== mesh;
		this._hovering = mesh;
		return different;
	}
	
	setSelected(mesh) {
		let different = this._selected !== mesh;
		this._selected = mesh;
		return different;
	}
	
	_boardGraphics() {
		return this._parent.boardGraphics();
	}
	
	_getPossibleMoves(piece) {
		return this._parent.getPossibleMoves(piece);
	}
	
	_showPossibleMoves(mesh, preview=false) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
			let moves = this._getPossibleMoves(piece);
			this._boardGraphics().showPossibleMoves(piece, moves, preview, 8);
		}
	}
	
	_hidePossibleMoves(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
			this._boardGraphics().hidePossibleMoves(piece, 8);
		}
	}
	

}

class MovePreviewer extends Interactor3DWorker {
	showMovesFor(mesh) {
		super.showMovesFor(mesh, true);
	}
}

class PieceSelector extends Interactor3DWorker /* Implements Clicker */ {

}

class MoveConfirmer extends Interactor3DWorker /* Implements Clicker */ {

}

export default Interactor3D;
