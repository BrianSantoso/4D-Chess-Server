import * as THREE from "three";
import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";
import { rotateObject } from "./Utils.js";
import Models from "./Models.js";
import { Selector } from "./Pointer.js";
import Animation from "./Animation.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";

/*

    Board Scale: 3 --> 300 x 300
    Piece Scale: 9
    Vertical Increment: 600 / (n=6) = 100
    Horizontal Increment: 450, but Space between boards: 150

*/

function GameBoard(n=4, Graphics, scene, animationQueue){
	
    this.n = n;
	this.graphics = new Graphics(this, scene, animationQueue);
    this.pieces = this.initPieces();
    
    let halfN = Math.floor((this.n - 1) / 2)
    this.test(halfN, halfN, halfN+2, halfN)
	
	this.setSelectability = function(team, canMove){
		// Enable/Disable piece rayCasting (block user interaction)
		this.applyToTeam(function(piece){
			this.graphics.setSelectability(piece, canMove);
//			piece.mesh.selectable = canMove
		}.bind(this), team)
	};
}

GameBoard.WHITE_WIN = 0;
GameBoard.BLACK_WIN = 1;
GameBoard.TIE = 2;
GameBoard.ONGOING = -1;


GameBoard.prototype = {
    
    initPieces: function(){
        //
        // Logic
        //
        
        // Instantiate pieces
        const range = n => [...Array(n)].map((_, i) => i);
        const rangeIn = dims => {
          if (!dims.length) return new Piece();
          return range(dims[0]).map(_ => rangeIn(dims.slice(1)));
        };
        
        const pieces = rangeIn([this.n, this.n, this.n, this.n])
        
        //
        // Graphics
        //
		return pieces;
    },
    
	// GameBoard.move should only be called from MoveManager. All move data received from server should pass through MoveManager.
    move: function(x0, y0, z0, w0, x1, y1, z1, w1){
		this.graphics.hidePossibleMoves(); // TODO: replace with pointer deselection
		const metaData = {}
		
		const targetPiece = this.pieces[x1][y1][z1][w1];
		if(targetPiece.type){
			Object.assign(metaData, {capturedPiece: targetPiece});
		}
        const piece = this.pieces[x0][y0][z0][w0];
		
		this.graphics.moveMesh(piece, x1, y1, z1, w1);
        
		this.pieces[x0][y0][z0][w0] = new Piece(); // Remove game object from board
		this.removePiece(x1, y1, z1, w1); // Immediately remove target game object and sprite (do nothing if square is empty)
        this.pieces[x1][y1][z1][w1] = piece; // Replace object in target square with moved piece
        Object.assign(metaData, piece.update(this.pieces, x0, y0, z0, w0, x1, y1, z1, w1));
		
		if(piece.type === 'pawn' && this.isOnPromotionSquare(x1, y1, z1, w1)){
			// Normal capture logic and animation is still executed,
			// but here we replace the pawn's game object with a Queen game object
			// Notice that we do not use GameObject.removePiece() method because
			// it will also remove its mesh, which we only want once the animation
			// finishes
			
			// The following 2 lines were causing bugs when spamming redo after a pawn promotion. Error was that the queen's mesh is undefined. The queen's .mesh property was not being set until the animation was complete. The fix was to create the mesh and set the queen's .mesh property immediately in the promotion logic, and only make it appear (add it to piecesContainer) when the animation is finished.
//			queen = new Queen(piece.team);
//			this.pieces[x1][y1][z1][w1] = queen;
			let queen = this.spawnPiece(Queen, piece.team, x1, y1, z1, w1, false);
			piece.descendant = queen;
			
			Object.assign(metaData, {promotion: true, newPiece: queen, oldPiece: piece});
		}
		
        return metaData;
    },
	
	undo: function(move){
		this.graphics.hidePossibleMoves(); // TODO: replace with pointer deselection
		const pieceInOriginalLoc = this.pieces[move.x0][move.y0][move.z0][move.w0];
		if(pieceInOriginalLoc.type){
			console.error('Unknown error. A piece is already located in original location')
		}
		const originalPiece = move.metaData.promotion ? move.metaData.oldPiece : this.pieces[move.x1][move.y1][move.z1][move.w1];
		this.pieces[move.x0][move.y0][move.z0][move.w0] = originalPiece;
		
		const capturedPiece = move.metaData.capturedPiece || new Piece();
		if(move.metaData.promotion){
			this.graphics.respawnMesh(originalPiece, move.x1, move.y1, move.z1, move.w1);
			this.removePiece(move.x1, move.y1, move.z1, move.w1); // TODO: THIS IS SCARY. If bugs occur separate the graphics component of removePiece into a new method. The current implementaiton might cause errors...
		}
		this.pieces[move.x1][move.y1][move.z1][move.w1] = capturedPiece;
		
		if (move.metaData.capturedPiece) {
			this.graphics.respawnMesh(capturedPiece, move.x1, move.y1, move.z1, move.w1); 
		}
		if (move.metaData.justMoved) {
			originalPiece.hasMoved = false;
		}
		this.graphics.moveMesh(originalPiece, move.x0, move.y0, move.z0, move.w0);
	},
	
	inCheck: function(team) {
		let attackers = Piece.inCheck(this.pieces, team);
		return attackers.length > 0;
	},
	
	winCondition: function() {
		if (Piece.inCheckmate(this.pieces, 0)) {
			return 1;
		} else if (Piece.inCheckmate(this.pieces, 1)) {
			return 0;
		} else if (Piece.inStalemate(this.pieces, 0) || Piece.inStalemate(this.pieces, 1)){
			return 2;
		} else {
			return -1;
		}
	},
	
	applyToAll: function(f){
		for(let x = 0; x < this.pieces.length; x++){
			for(let y = 0; y < this.pieces[0].length; y++){
				for(let z = 0; z < this.pieces[0][0].length; z++){
					for(let w = 0; w < this.pieces[0][0][0].length; w++){
						const piece = this.pieces[x][y][z][w]
						f(piece)
					}
				}
			}
		}
	},
	
	applyToPieces: function(f){
		function onlyPieces(piece){
			if(piece.type)
				f(piece)
		}
		this.applyToAll(onlyPieces)
	},
	
	applyToTeam: function(f, team){
		function onlyTeam(piece){
			if(piece.team === team){
				f(piece)
			}
		}
		this.applyToPieces(onlyTeam)
	},
    
	
	
    isOnPromotionSquare: function(x, y, z, w){
		const piece = this.pieces[x][y][z][w]
		const promotionLoc = piece.team > 0 ? 0 : this.n - 1
		return z === promotionLoc && w === promotionLoc
    },
    
    spawnPiece: function(PieceConstructor, team, x, y, z, w, addToContainer=true){
        const piece = new PieceConstructor(team)
        this.pieces[x][y][z][w] = piece
		this.graphics.setMesh(piece, x, y, z, w, addToContainer);
		return piece;
    },
	
	removePiece: function(x, y, z, w){
		const piece = this.pieces[x][y][z][w]
		this.graphics.removeMesh(piece);
		this.pieces[x][y][z][w] = new Piece();
	},
    
    inBounds: function(x, y, z, w) {
        return x >= 0 && x < this.n && y >= 0 && y < this.n && z >=0 && z < this.n && w >=0 && w < this.n;
    },
	
	package: function() {
		const x = this.pieces;
		const pieces = x.map(y => 
			y.map(z => 
				z.map(w => 
					w.map(piece => piece.package())
				)
			)
		);
		return pieces;
	},
	
	loadPieces: function(piecesArr) {
		this.graphics.abandon(); // remove all meshes from scene
		const Graphics = (this.graphics instanceof BoardGraphics) ? BoardGraphics : EmptyBoardGraphics;
		this.graphics = new Graphics(this, this.graphics.scene, this.graphics.animationQueue);
//		this.graphics = new Graphics(this) // create new graphics
		
		this.pieces = this.initPieces();
		for (let x = 0; x < this.n; x++) {
			for (let y = 0; y < this.n; y++) {
				for(let z = 0; z < this.n; z++) {
					for(let w = 0; w < this.n; w++) {
						const read = piecesArr[x][y][z][w];
						if (read.type) {
							const PieceConstructor = Piece.typeToConstructor[read.type];
							let piece = this.spawnPiece(PieceConstructor, read.team, x, y, z, w);
							Object.assign(piece, read);
						}
						
					}
				}
			}
		}
	},
    
    test: function(x, y, z, w){
        
        if(x == null) x = getRandomInteger(0, this.n)
        if(y == null) y = getRandomInteger(0, this.n)
        if(z == null) z = getRandomInteger(0, this.n)
        if(w == null) w = getRandomInteger(0, this.n)
		
        this.spawnPiece(Rook, 0, 0, 0, 0, 0)
        this.spawnPiece(Knight, 0, 1, 0, 0, 0)
        this.spawnPiece(Knight, 0, 2, 0, 0, 0)
        this.spawnPiece(Rook, 0, 3, 0, 0, 0)
        this.spawnPiece(Bishop, 0, 0, 1, 0, 0)
        this.spawnPiece(Pawn, 0, 1, 1, 0, 0)
        this.spawnPiece(Pawn, 0, 2, 1, 0, 0)
        this.spawnPiece(Bishop, 0, 3, 1, 0, 0)
        this.spawnPiece(Bishop, 0, 0, 2, 0, 0)
        this.spawnPiece(Queen, 0, 1, 2, 0, 0)
        this.spawnPiece(King, 0, 2, 2, 0, 0)
        this.spawnPiece(Bishop, 0, 3, 2, 0, 0)
        this.spawnPiece(Rook, 0, 0, 3, 0, 0)
        this.spawnPiece(Knight, 0, 1, 3, 0, 0)
        this.spawnPiece(Knight, 0, 2, 3, 0, 0)
        this.spawnPiece(Rook, 0, 3, 3, 0, 0)
        
        this.spawnPiece(Pawn, 0, 0, 0, 1, 0)
        this.spawnPiece(Pawn, 0, 1, 0, 1, 0)
        this.spawnPiece(Pawn, 0, 2, 0, 1, 0)
        this.spawnPiece(Pawn, 0, 3, 0, 1, 0)
        this.spawnPiece(Pawn, 0, 0, 1, 1, 0)
        this.spawnPiece(Pawn, 0, 1, 1, 1, 0)
        this.spawnPiece(Pawn, 0, 2, 1, 1, 0)
        this.spawnPiece(Pawn, 0, 3, 1, 1, 0)
        this.spawnPiece(Pawn, 0, 0, 2, 1, 0)
        this.spawnPiece(Pawn, 0, 1, 2, 1, 0)
        this.spawnPiece(Pawn, 0, 2, 2, 1, 0)
        this.spawnPiece(Pawn, 0, 3, 2, 1, 0)
        this.spawnPiece(Pawn, 0, 0, 3, 1, 0)
        this.spawnPiece(Pawn, 0, 1, 3, 1, 0)
        this.spawnPiece(Pawn, 0, 2, 3, 1, 0)
        this.spawnPiece(Pawn, 0, 3, 3, 1, 0)
        
        this.spawnPiece(Pawn, 0, 0, 0, 0, 1)
        this.spawnPiece(Pawn, 0, 1, 0, 0, 1)
        this.spawnPiece(Pawn, 0, 2, 0, 0, 1)
        this.spawnPiece(Pawn, 0, 3, 0, 0, 1)
        this.spawnPiece(Pawn, 0, 0, 1, 0, 1)
        this.spawnPiece(Pawn, 0, 1, 1, 0, 1)
        this.spawnPiece(Pawn, 0, 2, 1, 0, 1)
        this.spawnPiece(Pawn, 0, 3, 1, 0, 1)
        this.spawnPiece(Pawn, 0, 0, 2, 0, 1)
        this.spawnPiece(Pawn, 0, 1, 2, 0, 1)
        this.spawnPiece(Pawn, 0, 2, 2, 0, 1)
        this.spawnPiece(Pawn, 0, 3, 2, 0, 1)
        this.spawnPiece(Pawn, 0, 0, 3, 0, 1)
        this.spawnPiece(Pawn, 0, 1, 3, 0, 1)
        this.spawnPiece(Pawn, 0, 2, 3, 0, 1)
        this.spawnPiece(Pawn, 0, 3, 3, 0, 1)
        
        this.spawnPiece(Pawn, 0, 0, 0, 1, 1)
        this.spawnPiece(Pawn, 0, 1, 0, 1, 1)
        this.spawnPiece(Pawn, 0, 2, 0, 1, 1)
        this.spawnPiece(Pawn, 0, 3, 0, 1, 1)
        this.spawnPiece(Pawn, 0, 0, 1, 1, 1)
        this.spawnPiece(Pawn, 0, 1, 1, 1, 1)
        this.spawnPiece(Pawn, 0, 2, 1, 1, 1)
        this.spawnPiece(Pawn, 0, 3, 1, 1, 1)
        this.spawnPiece(Pawn, 0, 0, 2, 1, 1)
        this.spawnPiece(Pawn, 0, 1, 2, 1, 1)
        this.spawnPiece(Pawn, 0, 2, 2, 1, 1)
        this.spawnPiece(Pawn, 0, 3, 2, 1, 1)
        this.spawnPiece(Pawn, 0, 0, 3, 1, 1)
        this.spawnPiece(Pawn, 0, 1, 3, 1, 1)
        this.spawnPiece(Pawn, 0, 2, 3, 1, 1)
        this.spawnPiece(Pawn, 0, 3, 3, 1, 1)
        
        const l = this.n - 1 // Back row (black)
        const m = l - 1 // Front Row (black)
        
        this.spawnPiece(Rook, 1, 0, 0, l, l)
        this.spawnPiece(Knight, 1, 1, 0, l, l)
        this.spawnPiece(Knight, 1, 2, 0, l, l)
        this.spawnPiece(Rook, 1, 3, 0, l, l)
        this.spawnPiece(Bishop, 1, 0, 1, l, l)
        this.spawnPiece(Pawn, 1, 1, 1, l, l)
        this.spawnPiece(Pawn, 1, 2, 1, l, l)
        this.spawnPiece(Bishop, 1, 3, 1, l, l)
        this.spawnPiece(Bishop, 1, 0, 2, l, l)
        this.spawnPiece(Queen, 1, 1, 2, l, l)
        this.spawnPiece(King, 1, 2, 2, l, l)
        this.spawnPiece(Bishop, 1, 3, 2, l, l)
        this.spawnPiece(Rook, 1, 0, 3, l, l)
        this.spawnPiece(Knight, 1, 1, 3, l, l)
        this.spawnPiece(Knight, 1, 2, 3, l, l)
        this.spawnPiece(Rook, 1, 3, 3, l, l)
        
        this.spawnPiece(Pawn, 1, 0, 0, m, l)
        this.spawnPiece(Pawn, 1, 1, 0, m, l)
        this.spawnPiece(Pawn, 1, 2, 0, m, l)
        this.spawnPiece(Pawn, 1, 3, 0, m, l)
        this.spawnPiece(Pawn, 1, 0, 1, m, l)
        this.spawnPiece(Pawn, 1, 1, 1, m, l)
        this.spawnPiece(Pawn, 1, 2, 1, m, l)
        this.spawnPiece(Pawn, 1, 3, 1, m, l)
        this.spawnPiece(Pawn, 1, 0, 2, m, l)
        this.spawnPiece(Pawn, 1, 1, 2, m, l)
        this.spawnPiece(Pawn, 1, 2, 2, m, l)
        this.spawnPiece(Pawn, 1, 3, 2, m, l)
        this.spawnPiece(Pawn, 1, 0, 3, m, l)
        this.spawnPiece(Pawn, 1, 1, 3, m, l)
        this.spawnPiece(Pawn, 1, 2, 3, m, l)
        this.spawnPiece(Pawn, 1, 3, 3, m, l)
        
        this.spawnPiece(Pawn, 1, 0, 0, l, m)
        this.spawnPiece(Pawn, 1, 1, 0, l, m)
        this.spawnPiece(Pawn, 1, 2, 0, l, m)
        this.spawnPiece(Pawn, 1, 3, 0, l, m)
        this.spawnPiece(Pawn, 1, 0, 1, l, m)
        this.spawnPiece(Pawn, 1, 1, 1, l, m)
        this.spawnPiece(Pawn, 1, 2, 1, l, m)
        this.spawnPiece(Pawn, 1, 3, 1, l, m)
        this.spawnPiece(Pawn, 1, 0, 2, l, m)
        this.spawnPiece(Pawn, 1, 1, 2, l, m)
        this.spawnPiece(Pawn, 1, 2, 2, l, m)
        this.spawnPiece(Pawn, 1, 3, 2, l, m)
        this.spawnPiece(Pawn, 1, 0, 3, l, m)
        this.spawnPiece(Pawn, 1, 1, 3, l, m)
        this.spawnPiece(Pawn, 1, 2, 3, l, m)
        this.spawnPiece(Pawn, 1, 3, 3, l, m)
        
        this.spawnPiece(Pawn, 1, 0, 0, m, m)
        this.spawnPiece(Pawn, 1, 1, 0, m, m)
        this.spawnPiece(Pawn, 1, 2, 0, m, m)
        this.spawnPiece(Pawn, 1, 3, 0, m, m)
        this.spawnPiece(Pawn, 1, 0, 1, m, m)
        this.spawnPiece(Pawn, 1, 1, 1, m, m)
        this.spawnPiece(Pawn, 1, 2, 1, m, m)
        this.spawnPiece(Pawn, 1, 3, 1, m, m)
        this.spawnPiece(Pawn, 1, 0, 2, m, m)
        this.spawnPiece(Pawn, 1, 1, 2, m, m)
        this.spawnPiece(Pawn, 1, 2, 2, m, m)
        this.spawnPiece(Pawn, 1, 3, 2, m, m)
        this.spawnPiece(Pawn, 1, 0, 3, m, m)
        this.spawnPiece(Pawn, 1, 1, 3, m, m)
        this.spawnPiece(Pawn, 1, 2, 3, m, m)
        this.spawnPiece(Pawn, 1, 3, 3, m, m)
        
    }
    
}

export default GameBoard;