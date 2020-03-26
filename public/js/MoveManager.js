'use strict';

function MoveManager(gameBoard, clientTeam, mode, main=false) {
	this.gameBoard = gameBoard;
	this.clientTeam = 0;
	this.players = [new PlayerData(0, 300), new PlayerData(1, 300)];
	this.moveHistory = new DMoveList(gameBoard);
	this.main = main;
	
	this.move = function(x0, y0, z0, w0, x1, y1, z1, w1, receiving=false) {
		this.mode.move.call(this, x0, y0, z0, w0, x1, y1, z1, w1, receiving);
	}
	
	this.undo = function() {
		this.mode.undo.call(this)
	}
	
	this.redo = function() {
		this.mode.redo.call(this)
	}
	
	this.canMove = function(team) {
		return this.mode.canMove.call(this, team);
	}
	
	this.updateSelectability = function() {
		this.mode.updateSelectability.call(this);
	}
	
	this.moveStatus = function() {
		return this.mode.moveStatus.call(this);
	}
	
	this.updateUI = function() {
		toolbarProxy.setState({
			text: this.moveStatus()
		});
	}
	
	this.currTurn = function() {
		// the turn being viewed
		return this.moveHistory.currTurn();
	}
	
	this.whoseTurnViewed = function() {
		return this.currTurn() % 2;
	}
	
	this.whoseTurn = function() {
		return this.size() % 2;
	}
	
	this.size = function() {
		return this.moveHistory.size();
	}
	
	this.turnString = function() {
		return "Move " + this.currTurn() + "/" + this.size();
	}
	
	this.viewingMostRecentMove = function() {
		return this.currTurn() === this.size();
	}
	
	this.setSelectability = function(team, canSelect) {
		this.gameBoard.setSelectability(team, canSelect);
	}
	
	this.setMode = function(mode) {
		this.mode = mode;
		this.mode.updateSelectability.call(this);
	}
	
	this.setMode(mode)
	
	function PlayerData(team, clockTime){
		this.team = team;
		this.clockTime = clockTime;
	}
	
	this.update = function(){
		this.players[this.whoseTurn()].clockTime -= step;
		
		if(main) backendMoveManager.update();
	}
	
	this.package = function() {
		// function mainly for server to send state of game to clients
		const x = this.gameBoard.pieces;
		const pieces = x.map(y => 
			y.map(z => 
				z.map(w => 
					w.map(piece => piece.package())
				)
			)
		);
		
		let data = {
			moveHistory: this.moveHistory.package(),
			players: this.players,
			pieces: pieces
		}
		return data
	}
	
	
}


//MoveManager.SANDBOX = 0;
//MoveManager.LOCAL_MULTIPLAYER = 1;
//MoveManager.ONLINE_MULTIPLAYER = 2;

function DMoveList(gameBoard, curr){
	this.root = new MoveHistoryNode()
	this.curr = curr || this.root;
	this.gameBoard = gameBoard;
}

DMoveList.prototype = {
	add: function(x0, y0, z0, w0, x1, y1, z1, w1, metaData, appendToEnd=false){
		const newMoveHistoryNode = new MoveHistoryNode(new Move(x0, y0, z0, w0, x1, y1, z1, w1, metaData));
		if (appendToEnd) {
			let end = this.curr;
			while(end.next != null) {
				end = end.next;
			}
			newMoveHistoryNode.prev = end;
			end.next = newMoveHistoryNode;
		} else {
			newMoveHistoryNode.prev = this.curr;
			this.curr.next = newMoveHistoryNode;
			this.curr = newMoveHistoryNode;
		}
		return newMoveHistoryNode;
	},
	
	undo: function(){
		if(this.curr.prev){
			this.gameBoard.undo(this.curr.move);
			this.curr = this.curr.prev;
			return true;
		}
		return false;
	},
	
	redo: function(){
		if(this.curr.next){
			this.curr = this.curr.next;
			const x0 = this.curr.move.x0;
			const y0 = this.curr.move.y0;
			const z0 = this.curr.move.z0;
			const w0 = this.curr.move.w0;
			const x1 = this.curr.move.x1;
			const y1 = this.curr.move.y1;
			const z1 = this.curr.move.z1;
			const w1 = this.curr.move.w1;
			this.gameBoard.move(x0, y0, z0, w0, x1, y1, z1, w1);
			return true;
		}
		return false;
	},
	
	size: function() {
		let size = -1;
		let curr = this.root;
		while (curr != null) {
			curr = curr.next;
			size++;
		}
		return size;
	},
	
	indexOf: function(item) {
		let index = 0;
		let curr = this.root;
		while (curr != null) {
			if (curr == item) {
				return index;
			}
			curr = curr.next;
			index++;
		}
		return -1;
	},
	
	currTurn: function() {
		return this.indexOf(this.curr);
	},
	
	package: function() {
		const current = this.root;
		const newDList = new DMoveList(null);
		while(current) {
			newDList.add(current.package());
		}
		return newDList;
	}
}

function MoveHistoryNode(move){
	this.move = move || null;
	this.next = null;
	this.prev = null;
	
	this.package = function() {
		return {move: this.move ? this.move.package() : null}
	}
}

function Move(x0, y0, z0, w0, x1, y1, z1, w1, metaData){
	this.x0 = x0;
	this.y0 = y0;
	this.z0 = z0;
	this.w0 = w0;
	this.x1 = x1;
	this.y1 = y1;
	this.z1 = z1;
	this.w1 = w1;
//	this.capturedPiece = capturedPiece;
	this.metaData = metaData || {promotion: false};
	
	this.package = function() {
		return {
			x0: this.x0,
			y0: this.y0,
			z0: this.z0,
			w0: this.w0,
			x1: this.x1,
			y1: this.y1,
			z1: this.z1,
			w1: this.w1,
//			capturedPiece: this.capturedPiece.package(),
			metaData: (function(){
				let ret = {}
				for(var key in this.metaData) {
					if(this[key] && this[key] instanceof Piece) {
						ret[key] = this[key].package();
					} else {
						ret[key] = this[key];
					}
				}
				return ret;
			}.bind(this))()
		}
	}
}