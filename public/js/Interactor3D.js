import ChessGame from "./ChessGame.js";

class Interactor3D {
	constructor(team, chessGame, commandQueue, rayCaster) {
		this._team = team;
		this._game = chessGame;
		this._rayCaster = rayCaster;
		this._commandQueue = commandQueue;
		
		this._movePreviewer = new MovePreviewer(this, ChessGame.OMNISCIENT);
		this._pieceSelector = new PieceSelector(this, team);
		this._moveConfirmer = new MoveConfirmer(this, ChessGame.GHOST);
		
		
		let trySelectPiece = () => {
			this._pieceSelector.update(); // update _pieceSelector's hovering
			this._pieceSelector.select(); // set _pieceSelector's selected to its hovering
			if (this._pieceSelector.selected()) { // if clicked on a piece
				// Hide _movePreviewer's moves
				this._movePreviewer.showMovesFor(null);
				// Show the moves for what was selected
				this._pieceSelector.showMovesFor(this._pieceSelector.selected());
				this._pieceSelector.highlight(this._pieceSelector.selected());
				// TODO: make _pieceSelector highlight selected piece

				// Swap to selected state
				this.swapState(this._selected);
			}
			return this._pieceSelector.selected();
		}
		
		let tryConfirmMove = () => {
			this._moveConfirmer.update(); // update _moveConfirmer's hovering
			this._moveConfirmer.select(); // set _moveConfirmer's selected to its hovering

			let selectedGhost = this._moveConfirmer.selected()

			if (selectedGhost) { // if clicked on a ghost piece
				let move = selectedGhost.move;
				this.offerMove(move);
			}
			this.swapState(this._unselected);
			this._moveConfirmer.setSelected(null);
			this._pieceSelector.setSelected(null);
			this._pieceSelector.showMovesFor(null);
			this._pieceSelector.highlight(null);
			
			return selectedGhost;
		}
		
		// Define behavior for unselected state
		this._unselected = {
			update: () => {
				this._movePreviewer.update();
				this._movePreviewer.showMovesFor(this._movePreviewer.hovering());
				
				this._pieceSelector.update();
				this._pieceSelector.highlight(this._pieceSelector.hovering());
				// TODO: make _pieceSelector highlight hovering piece
			},
			onclick: () => {
				if (this._myTurn()) {
					trySelectPiece();
				}
			},
			onSwapOut: () => {}
		};
		
		// Define behavior for selected state
		this._selected = {
			update: () => {
				// Can optinally do something more, like highlight the ghost move that is being hovering on.
				// this._moveConfirmer.update();
			},
			onclick: () => {
				if (this._myTurn()) {
					let selectedGhost = tryConfirmMove();
					if (!selectedGhost) {
						// TODO: ghost will have raycast priority. trying to select
						// a piece in front of a ghost will fail, selecting the ghost
						// instead
						trySelectPiece();
					}
				}
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
//		this._commandQueue.push(move);
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
		this._highlighting = null;
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
				
				// In case this piece is already showing moves (through another selector)
				// hide moves and reshow to prevent possibility of double showing
//				this._hidePossibleMoves(mesh);
				/// edit: this shouldnt be the job of the interactor, but rather the board graphics
				
				this._showPossibleMoves(mesh, preview);
			}
		} else {
			this._hidePossibleMoves(this._showingMovesFor);
		}
		this._showingMovesFor = mesh;
	}
	
	highlight(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
			if (this._highlighting !== mesh) {
				// If different than already showing, hide previous and show new
				this._unhighlight(this._highlighting);
				// In case this piece is already showing moves (through another selector)
				// hide moves and reshow to prevent possibility of double showing
//				this._hidePossibleMoves(mesh);
				/// edit: this shouldnt be the job of the interactor, but rather the board graphics
				this._highlight(mesh);
			}
		} else {
			this._unhighlight(this._highlighting);
		}
		this._highlighting = mesh;		
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
			this._boardGraphics().showPossibleMoves(piece, moves, preview, 10);
		}
	}
	
	_hidePossibleMoves(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
//			this._boardGraphics().hidePossibleMoves(piece, 160);
			this._boardGraphics().hidePossibleMoves(piece, 10);
		}
	}
	
	_highlight(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
			this._boardGraphics().highlight(piece, 6);
		}
	}
	
	_unhighlight(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let piece = mesh.piece;
			this._boardGraphics().unhighlight(piece, 6);
		}
	}
	

}

class MovePreviewer extends Interactor3DWorker {
	showMovesFor(mesh) {
//		super.showMovesFor(mesh, true);
	}
}

class PieceSelector extends Interactor3DWorker {

}

class MoveConfirmer extends Interactor3DWorker {

}

export default Interactor3D;
