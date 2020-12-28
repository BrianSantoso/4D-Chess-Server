import { AbstractReceiver3D } from "./Receiver.js";
import ChessTeam from "./ChessTeam.js";
import config from "./config.json";

class Interactor3D extends AbstractReceiver3D {
	constructor(team, chessGame, player, rayCaster) {
		super(team, chessGame, player);
		this._rayCaster = rayCaster;
		
		this._movePreviewer = new MovePreviewer(this, ChessTeam.OMNISCIENT);
		this._pieceSelector = new PieceSelector(this, team);
		this._moveConfirmer = new MoveConfirmer(this, ChessTeam.GHOST);
		this._moveExplainer = new MoveExplainer(this, ChessTeam.oppositeTeam(team));
		
		
		let trySelectPiece = () => {
			this._pieceSelector.update(); // update _pieceSelector's hovering
			this._pieceSelector.select(); // set _pieceSelector's selected to its hovering

			let selected = this._pieceSelector.selected();

			// ideally this should be its own Interactor3DWorker
			if (selected) { // if clicked on a piece
				// Hide _movePreviewer's moves
				this._movePreviewer.showMovesFor(null);

				let unadressedCheck = this._pieceSelector.explainIfUnadressedCheck(selected);

				// Uncomment if you want to disable ability to select pieces which are pinned OR
				// do not address a check
				// if (unadressedCheck) {
				// 	this._pieceSelector.setSelected(null);
				// 	return;
				// }

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
			this._moveExplainer.update();
			this._moveExplainer.select();
			
			let selectedGhost = this._moveConfirmer.selected();
			let selectedPiece = this._pieceSelector.selected();
			let destination = this._moveExplainer.selected();

			if (selectedGhost) { // if clicked on a ghost piece
				let move = selectedGhost.move;
				this.offerMove(move);
			} else if (destination) {
				// Pitfall of having a separate moveExplainer and moveConfirmer
				// is that clicking a ghost that is behind of a blockedDestination
				// will favor the ghost.
				// The silver lining is that selecting a capture move will always work.
				this._moveExplainer.explainIfBlocked(selectedPiece);
			}
			this.unselect();
			
			return selectedGhost;
		}
		
		// Define behavior for unselected state
		this._unselected = {
			update: () => {
				// try show moves
				this._movePreviewer.update();
				this._movePreviewer.showMovesFor(this._movePreviewer.hovering());
				
				// try highlight
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

	unselect() {
		this.swapState(this._unselected);
		this._moveConfirmer.setSelected(null);
		this._moveExplainer.setSelected(null);
		this._pieceSelector.setSelected(null);
		this._pieceSelector.showMovesFor(null);
		this._pieceSelector.highlight(null);
	}

	needsRayCaster() {
		return true;
	}
	
	needsClickEvent() {
		return true;
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
	
	getPossibleMoves(id, legalOnly=true) {
		return this._game.getPossibleMoves(id, legalOnly);
	}
	
	rayCast(team) {
		team = team || this.team; // default to Interactor's team
		return this.boardGraphics().rayCast(this._rayCaster, team);
	}

	inCheck(team) {
		return this._game.inCheck(team);
	}

	isLegal(move) {
		return this._game.isLegal(move);
	}

	explainAll(attackers) {
		this.boardGraphics().explainAll(attackers);
	}
	
	offerMove(move) {
		this._player.makeMove(move);
	}
	
	_myTurn() {
		return this._team === this._game.currTurn();
	}
}

Interactor3D.isPiece = function(mesh) {
	return mesh && typeof mesh.pieceId !== undefined;
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
	
	highlight(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			if (this._highlighting !== mesh) {
				// If different than already showing, hide previous and show new
				this._unhighlight(this._highlighting);
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

	explainIfUnadressedCheck(meshToMove) {
		let pieceToMoveId = meshToMove.pieceId;
		let notKing = pieceToMoveId.type !== 'king';
		let legalMoves = this._getPossibleMoves(pieceToMoveId);
		let theoreticalMoves = this._getPossibleMoves(pieceToMoveId, false);
		if (notKing && legalMoves.length === 0 && theoreticalMoves.length > 0) {
			let attackers = this._inCheck();
			this._explainAll(attackers);
			return true;
		}
		return false;
	}

	explainIfBlocked(meshToMove) {
		let blockedMove = this._isBlocked(meshToMove);
		if (blockedMove) {
			this._explainWhyBlocked(blockedMove);
		}
	}

	_inCheck() {
		return this._parent.inCheck(this._team);
	}
	
	_boardGraphics() {
		return this._parent.boardGraphics();
	}
	
	_getPossibleMoves(pieceId, legalOnly=true) {
		return this._parent.getPossibleMoves(pieceId, legalOnly);
	}
	
	_showPossibleMoves(mesh, preview=false) {
		if (Interactor3D.isPiece(mesh)) {
			let pieceId = mesh.pieceId;
			let moves = this._getPossibleMoves(pieceId);
			this._boardGraphics().showPossibleMoves(pieceId, moves, preview, config.animFrames.showMoves);
		}
	}
	
	_hidePossibleMoves(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let pieceId = mesh.pieceId;
			this._boardGraphics().hidePossibleMoves(pieceId, config.animFrames.hideMoves);
		}
	}
	
	_highlight(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let pieceId = mesh.pieceId;
			this._boardGraphics().highlight(pieceId, config.animFrames.highlight);
		}
	}
	
	_unhighlight(mesh) {
		if (Interactor3D.isPiece(mesh)) {
			let pieceId = mesh.pieceId;
			this._boardGraphics().unhighlight(pieceId, config.animFrames.unhighlight);
		}
	}

	_isBlocked(originalMesh) {
		// Returns the blocked move of originalMesh corresponding to
		// the destination given by this.selected();
		let pieceToMoveId = originalMesh.pieceId;
		let moves = this._getPossibleMoves(pieceToMoveId, false);
		// TODO: move this logic to GameBoard
		let destination = this.selected().piece;
		for (let i = 0; i < moves.length; i++) {
			let move = moves[i];
			if (move.destinationIs(destination.x, destination.y, destination.z, destination.w)) {
				return move;
			}
		}
		return null;
	}

	_explainWhyBlocked(move) {
		let attackers = this._isLegal(move);
		this._explainAll(attackers);
	}

	_explainAll(attackers) {
		this._parent.explainAll(attackers);
	}

	_isLegal(move) {
		return this._parent.isLegal(move);
	}
}

class MovePreviewer extends Interactor3DWorker {
	showMovesFor(mesh) {
		
	}
}

class PieceSelector extends Interactor3DWorker {

}

class MoveConfirmer extends Interactor3DWorker {

}

class MoveExplainer extends Interactor3DWorker {

}

export default Interactor3D;
