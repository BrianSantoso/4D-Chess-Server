import ChessGame from "./ChessGame.js";

class ChessPlayer {
	// A ChessGame controller. Defines what method is used to receive moves
	// (e.g. through a 3D UI, over the the internet, an AI),
	// and how to transmit information after making moves
	constructor(chessGame, team) {
		this._game = chessGame;
		this._team = team;
	}
	
	makeMove(move) {
		this._game.makeMove(move);
	}
}


class LocalPlayer3D extends ChessPlayer {
	constructor(chessGame, team) {
		super(chessGame, team);
		
		this._hovering = null;
		this._selected = null;
		
		// State pattern: each behavior object defines behavior for a given state
		this._unselectedBehavior = {
			keyInputs: () => {
				let intersected = this._game.rayCast(this._team);
				this.setHovering(intersected);
				
				let isPiece = this._isPiece(this.getHovering());
				if (isPiece) {
					let piece = this._getPiece(this.getHovering());
//					this._game.previewPossibleMoves(piece);
				} else {
//					this._game.hidePossibleMoves();
				}
			},
			
			onclick: () => {
				this.setSelected(this.getHovering());
				
				if (this.getSelected()) {
					this.setBehavior(this._selectedBehavior);
					
					let piece = this._getPiece(this.getSelected());
					this._game.showPossibleMoves(piece);
				}
			}
		};
		
		this._selectedBehavior = {
			keyInputs: () => {
				let intersected = this._game.rayCast(ChessGame.GHOST);
				this.setHovering(intersected);
				
//				let piece = this._getPiece(this.getSelected()); // TODO: can optimize by putting in _unselectedBehavior.onclick();
//				this._game.showPossibleMoves(piece);
			},
			
			onclick: () => {
				if (this._isGhost(this.getHovering())) {
					this.makeMove(this.getHovering().move);
				}
				this._game.hidePossibleMoves();
				this.setSelected(null);
				this.setBehavior(this._unselectedBehavior);
			}
		};
		
		this._notMyTurn = {
			keyInputs: () => {
				
			},
			
			onclick: () => {
				
			}
		}
		
		this._behavior = this._unselectedBehavior;
	}
	
	_isPiece(mesh) {
		return mesh && !!mesh.piece;
	}
	
	_isGhost(mesh) {
		return mesh && !!mesh.move;
	}
	
	_getPiece(mesh) {
		return mesh.piece;
	}
	
	_getMove(mesh) {
		return mesh.move;
	}
	
	onclick() {
		this._behavior.onclick();
	}
	
	keyInputs() {
		this._behavior.keyInputs();
	}
	
	setHovering(mesh) {
		this._hovering = mesh;
	}
	
	setSelected(mesh) {
		// You should not be able to select a ghost...
		this._selected = mesh;
//		if (this._isPiece(mesh)) {
//			this._selected = mesh;
//		}
		
		
		// Do NOT: "else set to null" because then if
		// you try to click on a piece behind it's preview
		// ghost, then it would not select the piece
	}
	
	setBehavior(behavior) {
		// Switches states
		this._behavior = behavior;
	}
	
	getHovering() {
		return this._hovering;
	}
	
	getSelected() {
		return this._selected;
	}
}

//class LocalPlayer3D extends Player3D {
//	// Local Player does not need to transmit anything
//}

class OnlinePlayer3D extends LocalPlayer3D /* implements Transmitter */ {
	
	makeMove(move) {
		super.move();
		// TODO: send move to server
	}
}

class MoveReceiver extends ChessPlayer /* implements Receiver */ {
	
}

class MoveReceiverTransmitter extends MoveReceiver /* implements Transmitter */ {
	
}

class AIPlayer extends ChessPlayer {
	
}

export { LocalPlayer3D, OnlinePlayer3D }