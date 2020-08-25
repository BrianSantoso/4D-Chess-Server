import * as THREE from "three";
import Animator from "./Animator.js";
import { debugSphere, rotateObject, checkerboard4D } from "./Utils3D.js";
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
		
		this._canInteract = true;
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
		let newZ = (this._deltaW + boardSize) * w + z * this._squareSize;
		return new THREE.Vector3(x * this._squareSize, 
								 y * this._deltaY, 
								 -newZ).add(this._container.position);
	}
	
	update() {
		this._animator.update();
//		if (this._animator.isOccupied()) {
//			this._disableInteraction();
//		} else {
//			this._enableInteraction();
//		}
	}
	
	_disableInteraction() {
		this._canInteract = false;
	}
	
	_enableInteraction() {
		this._canInteract = true;
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
		this._container.add(checkerboard4D(this.n, square, square * 3, square * 1.5));
		
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
	
	_spawnMeshFromPiece(pieceObj, frames=0) {
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
		
		if (frames) {
			this._grow(mesh, frames);
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
		// Fixes issue with transparent board hiding transparent pieces
		// https://discourse.threejs.org/t/material-transparency-problem/3822
//		mesh.material.depthWrite = false;
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
	}
	
	showPossibleMoves(piece, moves, preview=false, frames=0) {
		
		// hide moves if already showing
		this.hidePossibleMoves(piece, frames);
		let meshes = new Set();
		
		moves.forEach(move => {
			let mesh = this._spawnGhostMesh(piece, move, preview);
			
			if (frames) {
				this._fadeIn(mesh, frames);
			}
			
			meshes.add(mesh);
		});
		// TODO: is this even doing anything?
		this._showingMovesFor.set(piece, meshes);
	}
	
	hidePossibleMoves(piece, frames=0) {
		let meshes = this._showingMovesFor.get(piece);
		if (!meshes) {
			return;
		}
		if (frames) {
			meshes.forEach(mesh => {
				this._fadeOut(mesh, frames, () => {
					this._ghost.remove(mesh);
					meshes.delete(mesh);
				});
			});
			// TODO: remove meshes from _showingMovesFor?
		} else {
			this._ghost.remove(...meshes);
			meshes.forEach(mesh => meshes.delete(mesh));
		}
	}
	
	rayCast(rayCaster, targetTeam=ChessGame.OMNISCIENT) {
		
		if (!this._canInteract) {
			return null;
		}
		
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
	
	makeMove(move, frames=0) {
		if (frames) {
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
					this._spawnMeshFromPiece(move.promotionNew, 16);
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

export default BoardGraphics;