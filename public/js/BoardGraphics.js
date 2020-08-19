import * as THREE from "three";
import Animator from "./Animator.js";
import { debugSphere, rotateObject } from "./Utils3D.js";
import Models from "./Models.js";
import ChessGame from "./ChessGame.js";

class BoardGraphics {
	constructor(n) {
		this.n = n;
		this._container = new THREE.Group();
		this._pieces = new THREE.Group();
		this._white = new THREE.Group();
		this._black = new THREE.Group();
		this._ghost = new THREE.Group();
		this._pieces.add(this._white);
		this._pieces.add(this._black);
		this._pieces.add(this._ghost);
		
		this._container.add(this._pieces);
		
		this._animator = new Animator();
		
		this._squareSize = 25;
		this._deltaY = this._squareSize * 3;
		this._deltaW = this._squareSize * 1.5;
		
		this._init();
	}
	
	to3D(x, y, z, w) {
		// Board Coordinates to World Coords
		let boardSize = this._squareSize * this.n;
		let newZ = (this._deltaW + boardSize) * w + z * this._squareSize
		return new THREE.Vector3(x * this._squareSize, 
								 y * this._deltaY, 
								 -newZ).add(this._container.position);
	}
	
	update() {
		
	}
	
	view3D() {
		return this._container;
	}
	
	_init() {
		let square = 25;
		this._container.add(BoardGraphics.checkerboard4D(this.n, square, square * 3, square * 1.5));
		
		console.log('BoardGraphics', this._container);
	}
	
	_spawnMesh(pieceObj, material=null, pos=null) {
		if (pieceObj.isEmpty()) {
			return null;
		}
		if (!material) {
			material = pieceObj.team === ChessGame.WHITE ? 'white' : 'black';
		}
		
		if (!pos) {
			pos = this.to3D(pieceObj.x, pieceObj.y, pieceObj.z, pieceObj.w);
		}
		let mesh = Models.createMesh(pieceObj.type, material, pos);
		
		// bind associated piece to mesh
		mesh.piece = pieceObj;
		
		let rotation = pieceObj.team === ChessGame.WHITE ? 180 : 0;
		rotateObject(mesh, 0, rotation, 0);
		if (pieceObj.team === ChessGame.WHITE) {
			this._white.add(mesh);
		} else if (pieceObj.team === ChessGame.BLACK) {
			this._black.add(mesh);
		} else {
			this._ghost.add(mesh);
		}
		
		return mesh;
	}
	
	spawnPieces(pieces) {
		this._container.remove(this._pieces);
		this._pieces = new THREE.Group();
		this._white = new THREE.Group();
		this._black = new THREE.Group();
		this._ghost = new THREE.Group();
		this._pieces.add(this._white);
		this._pieces.add(this._black);
		this._pieces.add(this._ghost);
		
		pieces.flat(3).forEach(pieceObj => {
			this._spawnMesh(pieceObj);
		});
		
		this._container.add(this._pieces);
	}
	
	showPossibleMoves(piece, moves) {
		if (this._ghost.children.length) {
			return;
		}
		
		let team = piece.team; // TODO: this is gross
		piece.team = ChessGame.GHOST;
		moves.forEach(move => {
			let material = move.capturedPiece.isEmpty() ? 'green' : 'red';
			let pos = this.to3D(move.x1, move.y1, move.z1, move.w1);
			this._spawnMesh(piece, material, pos);
//			console.log(move)
		});
		piece.team = team;
	}
	
	hidePossibleMoves() {
		this._ghost.remove(...this._ghost.children);
	}
	
	rayCast(rayCaster) {
		let group;
		let candidates = this._white.children
							.concat(this._black.children)
							.concat(this._ghost.children);
		let intersects = rayCaster.intersectObjects(candidates);
		if (intersects.length > 0) {
			return intersects[0].object;
		} else {
			return null;
		}
	}
}

BoardGraphics.checkerboard = function(n=4, squareSize=25, y=0, w=0){
	const thickness = 2;
	const opacity = 0.5;
	const boardSize = n * squareSize;
	
	const getMat = (primary, flip) => new THREE.MeshBasicMaterial({
		color: primary ? 0xccccfc : 0x444464, 
		transparent: true, 
		opacity: opacity, 
		side: flip ? THREE.BackSide : THREE.FrontSide
	});
	const getMatArr = (flip) => [getMat(true, flip), getMat(false, flip)];
	
	let topGeometry = new THREE.PlaneGeometry(boardSize, boardSize, n, n);
	let bottomGeometry = new THREE.PlaneGeometry(boardSize, boardSize, n, n);
	let sideGeometry = new THREE.PlaneGeometry(thickness, boardSize, 1, n);
	
	let materialsTop = getMatArr(false);
	let materialsBottom = getMatArr(true);
	let materialsSide = getMatArr(false);
	
	for(let x = 0; x < n; x++){
      for(let z = 0; z < n; z++){
          let i = x * n + z;
          let j = i * 2;
		  topGeometry.faces[j].materialIndex = topGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;
		  bottomGeometry.faces[j].materialIndex = bottomGeometry.faces[j + 1].materialIndex = (x + y + z + w) % 2;
		  
		  let k = x;
		  let l = k * 2;
		  sideGeometry.faces[l].materialIndex = sideGeometry.faces[l + 1].materialIndex = (x + y + z + w) % 2;
      }
    }
	
	let topMesh = new THREE.Mesh(topGeometry, materialsTop);
	let bottomMesh = new THREE.Mesh(bottomGeometry, materialsBottom);
	let sideMesh1 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh2 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh3 = new THREE.Mesh(sideGeometry, materialsSide);
	let sideMesh4 = new THREE.Mesh(sideGeometry, materialsSide);
	
	rotateObject(sideMesh1, 0, 90, 0); //front
	rotateObject(sideMesh2, 90, 0, 90); //left
	rotateObject(sideMesh3, 180, -90, 0); //back
	rotateObject(sideMesh4, -90, 0, -90); //right
	
	bottomMesh.position.set(0, 0, -thickness);
	sideMesh1.position.set(boardSize / 2, 0, -thickness / 2);
	sideMesh2.position.set(0, -boardSize / 2, -thickness / 2);
	sideMesh3.position.set(-boardSize / 2, 0, -thickness / 2);
	sideMesh4.position.set(0, boardSize / 2, -thickness / 2);
	
	let boxContainer = new THREE.Group();
	boxContainer.add(topMesh);
	boxContainer.add(bottomMesh);
	boxContainer.add(sideMesh1);
	boxContainer.add(sideMesh2);
	boxContainer.add(sideMesh3);
	boxContainer.add(sideMesh4);
	
	rotateObject(boxContainer, -90, 0, 0)
	return boxContainer;
}

BoardGraphics.checkerboard4D = function(n, squareSize, deltaY, deltaW) {
	let board4D = new THREE.Group();
	for (let y = 0; y < 4; y++) {
		for (let w = 0; w < 4; w++) {
			let boardSize = n * squareSize;
			let board2D = BoardGraphics.checkerboard(n, squareSize, y, w);
			board2D.position.set(0, deltaY * y, -(boardSize + deltaW) * w);
			board4D.add(board2D);
		}
	}
	// Make Origin the center of the first square
	board4D.position.set(squareSize * 1.5, 0, -squareSize * 1.5);
	return board4D;
};

export default BoardGraphics;