import * as THREE from "three";
import Animator from "./Animator.js";
import { debugSphere, rotateObject } from "./Utils3D.js";
import Models from "./Models.js";
import ChessGame from "./ChessGame.js";

// TODO: update graphics hierarchy
// BoardGrahpics
//    -> Graphics3D
//    -> NullGrahpics

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
		
		this._showingMovesFor = new Map();
		
		this._container.add(this._pieces);
		
		this._animator = new Animator();
		
		this._squareSize = 25;
		this._deltaY = this._squareSize * 3;
		this._deltaW = this._squareSize * 1.5;
		
		this._pieceToMesh = new Map();
		
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
		this._animator.update();
	}
	
	view3D() {
		return this._container;
	}
	
	getBoundingBox() {
		return this._boundingBox;
	}
	
	_init() {
		// TODO: revive after testing fix for transparent objects (im trying to add the board last)
		let square = 25;
		this._container.add(BoardGraphics.checkerboard4D(this.n, square, square * 3, square * 1.5));
		
//		let min = this._container.position.copy();
//		
//		let boardSize = this._squareSize * this.n;
//		let max = new THREE.Vector3(boardSize, 
//									boardSize * this.n + this._deltaW * (this.n - 1), 
//									this._deltaY * this.n
//								   ).add(min);
//		
//		this._boundingBox = new THREE.Box3(min, max);
		
		console.log('BoardGraphics', this._container);
	}
	
	_spawnMeshFromPiece(pieceObj, animate=true) {
		if (pieceObj.isEmpty()) {
			return null;
		}
		let material = pieceObj.team === ChessGame.WHITE ? 'white' : 'black';
		let pos = this.to3D(pieceObj.x, pieceObj.y, pieceObj.z, pieceObj.w);
		let mesh = Models.createMesh(pieceObj.type, material, pos);
		let rotation = pieceObj.team === ChessGame.WHITE ? 180 : 0;
		rotateObject(mesh, 0, rotation, 0);
		if (pieceObj.team === ChessGame.WHITE) {
			this._white.add(mesh);
		} else if (pieceObj.team === ChessGame.BLACK) {
			this._black.add(mesh);
		}
		// bind associated piece to mesh
		mesh.piece = pieceObj;
		
		this._pieceToMesh.set(pieceObj, mesh);
		
		if (animate) {
			this._grow(mesh, 12);
		}
		
		return mesh;
	}
	
	_spawnGhostMesh(pieceObj, move, preview) {
		let pos = this.to3D(move.x1, move.y1, move.z1, move.w1);
		let team = pieceObj.team;
		let type = pieceObj.type;
		if (!move.capturedPiece.isEmpty()) {
			team = move.capturedPiece.team;
			type = move.capturedPiece.type;
		}
		
		let material; // TODO: implement some sort of materials scheme. this is kind of messy
		if (preview) {
			material = move.capturedPiece.isEmpty() ? 'lightGray' : 'darkGray';
		} else {
			material = move.capturedPiece.isEmpty() ? 'green' : 'orange';
		}
		
		let scale = move.capturedPiece.isEmpty() ? 1 : 1;
		let mesh = Models.createMesh(type, material, pos, scale);
		let rotation = team === ChessGame.WHITE ? 180 : 0;
		rotateObject(mesh, 0, rotation, 0);
		this._ghost.add(mesh);
		
		mesh.move = move;
		
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
			this._spawnMeshFromPiece(pieceObj);
		});
		
		
		this._container.add(this._pieces);
//		let square = 25;
//		this._container.add(BoardGraphics.checkerboard4D(this.n, square, square * 3, square * 1.5));
	}
	
	showPossibleMoves(piece, moves, preview=false, frames=0) {
		
		let meshes = [];
		
		moves.forEach(move => {
			let mesh = this._spawnGhostMesh(piece, move, preview);
			
			if (frames) {
				this._fadeIn(mesh, frames);
			}
			
			meshes.push(mesh);
		});
		
		this._showingMovesFor.set(piece, meshes);
	}
	
	hidePossibleMoves(piece, frames=0) {
		let meshes = this._showingMovesFor.get(piece);
		if (frames) {
			meshes.forEach(mesh => {
				this._fadeOut(mesh, frames, () => {
					this._ghost.remove(mesh);
				});
			});
		} else {
			this._ghost.remove(...meshes);
		}
	}
	
	rayCast(rayCaster, targetTeam=ChessGame.OMNISCIENT) {
		let group;
		let candidates = [];
		
		if (targetTeam.permissions.get(ChessGame.WHITE)) {
			candidates = candidates.concat(this._white.children);
		}
		if (targetTeam.permissions.get(ChessGame.BLACK)) {
			candidates = candidates.concat(this._black.children);
		}
		if (targetTeam.permissions.get(ChessGame.GHOST)) {
			candidates = candidates.concat(this._ghost.children);
		}
		
		let intersects = rayCaster.intersectObjects(candidates);
		if (intersects.length > 0) {
			return intersects[0].object;
		} else {
			return null;
		}
	}
	
	makeMove(move, animate) {
		if (animate) {
			let mesh = this._pieceToMesh.get(move.piece);
			let startPos = this.to3D(move.x0, move.y0, move.z0, move.w0);
			let endPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
			let numFrames = 16;
			let capturedMesh = this._pieceToMesh.get(move.capturedPiece);
			
			let onFinish = () => {
				this._remove(capturedMesh);
				if (move.promotionNew) {
					this._shrink(mesh, numFrames, () => {
						this._remove(mesh);
					});
					this._spawnMeshFromPiece(move.promotionNew);
				}
			}
			
			let frames = Animator.translate(Animator.QUADRATIC, mesh, startPos, endPos, numFrames, onFinish);
			this._animator.animate(frames);
			
			
			if (capturedMesh) {
				this._shrink(capturedMesh, numFrames);
			}
			
			
		} else {
			let mesh = this._pieceToMesh.get(move.piece);
			let capturedMesh = this._pieceToMesh.get(move.capturedPiece);

			let newPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
			mesh.position.set(newPos.x, newPos.y, newPos.z);
			this._remove(capturedMesh);

			if (move.promotionNew) {
				this._remove(mesh);
				this._spawnMeshFromPiece(move.promotionNew);
			}
		}	
	}
	
	_remove(mesh) {
		// Do not remove from _pieceToMesh or else we will lose 
		// it forever and wont be able to undo moves graphically
		this._white.remove(mesh);
		this._black.remove(mesh);
	}
	
	_shrink(mesh, numFrames, onFinishCallback) {
		let animation = Animator.scale(Animator.LINEAR, mesh, mesh.scale.x, 0, numFrames, onFinishCallback);
		this._animator.animate(animation);
	}
	
	_grow(mesh, numFrames, onFinishCallback) {
		let animation = Animator.scale(Animator.LINEAR, mesh, 0, mesh.scale.x, numFrames, onFinishCallback);
		this._animator.animate(animation);
	}
	
	_fadeIn(mesh, numFrames, onFinishCallback) {
		// Assumes mesh.material.transparent
		// mode, mesh, startOpacity, endOpacity, numFrames, onFinishCallback
		let animation = Animator.opacity(Animator.LINEAR, mesh, 0, mesh.material.opacity, numFrames, onFinishCallback);
		animation.override = true;
		this._animator.animate(animation);
	}
	
	_fadeOut(mesh, numFrames, onFinishCallback) {
		// Assumes mesh.material.transparent
		let animation = Animator.opacity(Animator.LINEAR, mesh, mesh.material.opacity, 0, numFrames, onFinishCallback);
		animation.override = true;
		this._animator.animate(animation);
	}
}

BoardGraphics.checkerboard = function(n=4, squareSize=25, y=0, w=0){
	const thickness = 2;
	const opacity = 0.5;
	const boardSize = n * squareSize;
	
	const getMat = (primary, flip) => {
		let mat = new THREE.MeshBasicMaterial({
			color: primary ? 0xccccfc : 0x444464, 
			transparent: true, 
			opacity: opacity, 
			side: flip ? THREE.BackSide : THREE.FrontSide
		});
		// Fixes issue with transparent board hiding transparent pieces
		// https://discourse.threejs.org/t/material-transparency-problem/3822
		mat.depthWrite = false;
		return mat;
	};
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
	
//	sideMesh1.renderOrder = -1;
//	sideMesh2.renderOrder = -1;
//	sideMesh3.renderOrder = -1;
//	sideMesh4.renderOrder = -1;
//	topMesh.renderOrder = -1;
//	bottomMesh.renderOrder = -1;
	
	let boxContainer = new THREE.Group();
	boxContainer.add(topMesh);
	boxContainer.add(bottomMesh);
	boxContainer.add(sideMesh1);
	boxContainer.add(sideMesh2);
	boxContainer.add(sideMesh3);
	boxContainer.add(sideMesh4);
	
	rotateObject(boxContainer, -90, 0, 0)
	
	
//	boxContainer.renderOrder = -1;
	
	return boxContainer;
}

BoardGraphics.checkerboard4D = function(n, squareSize, deltaY, deltaW) {
	let board4D = new THREE.Group();
	for (let y = 0; y < n; y++) {
		for (let w = 0; w < n; w++) {
			let boardSize = n * squareSize;
			let board2D = BoardGraphics.checkerboard(n, squareSize, y, w);
			board2D.position.set(0, deltaY * y, -(boardSize + deltaW) * w);
			board4D.add(board2D);
		}
	}
	// Make Origin the center of the first square
	let distToEdge = squareSize * (n - 1) / 2;
	board4D.position.set(distToEdge, 0, -distToEdge);
	return board4D;
};

export default BoardGraphics;