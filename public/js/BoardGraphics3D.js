import BoardGrahpics from "./BoardGraphics.js";
import * as THREE from "three";
import Animator, { Animation } from "./Animator.js";
import { debugSphere, rotateObject, checkerboard4D } from "./Utils3D.js";
import Models from "./Models.js";
import ChessTeam from "./ChessTeam.js";
import config from "./config.json";

// TODO: update graphics hierarchy
// BoardGrahpics
//    -> Graphics3D
//    -> NullGrahpics

class BoardGraphics3D extends BoardGrahpics {
	constructor(dim) {
        super();
		this.dim = dim;
		this._container = new THREE.Group();
		this._pieces = new THREE.Group();
		this._white = new THREE.Group();
		this._black = new THREE.Group();
		this._ghost = new THREE.Group();
		this._highlight = new THREE.Group();
		this._checkerboards = new THREE.Group();
		this._pieces.add(this._white);
		this._pieces.add(this._black);
		this._pieces.add(this._ghost);
		this._pieces.add(this._highlight);
		
		this._canInteract = true;
		// TODO: use Piece id as key
		this._showingMovesFor = new Map(); // map of Piece objects to their Set of possible move meshes (Ghost meshes)
		this._highlightingFor = new Map(); // map of Piece objects to their temporary highlight meshes
		this._idToMesh = new Map();
		this._idToPiece = new Map();

		this._container.add(this._pieces);
		this._container.add(this._checkerboards);
		
		this._animator = new Animator();
		this._allAnimProms = [];
		
		this._squareSize = 25;
		this._deltaY = this._squareSize * 3;
		this._deltaW = this._squareSize * 1.5;
		
		this._init();
	}

	_x() {
		return this.dim[0];
	}

	_y() {
		return this.dim[1];
	}

	_z() {
		return this.dim[2];
	}

	_w() {
		return this.dim[3];
	}
	
	to3D(x, y, z, w) {
		// Board Coordinates to World Coords
		let boardSizeZ = this._squareSize * this._z();
		let newZ = (this._deltaW + boardSizeZ) * w + z * this._squareSize;
		return new THREE.Vector3(x * this._squareSize, 
								 y * this._deltaY, 
								 -newZ).add(this._container.position);
	}

	idToMesh(id) {
		let mesh = this._idToMesh.get(id);
		// if (!mesh) {
		// 	this._spawnMeshFromPiece(piece, 0);
		// 	mesh = this._pieceToMesh.get(piece);
		// }
		return mesh;
	}

	idToPiece(id) {
		return this._idToPiece.get(id);
	}
	
	update() {
		this._animator.update();
	}
	
	_disableInteraction() {
		this._canInteract = false;
	}
	
	_enableInteraction() {
		this._canInteract = true;
	}
	
	// TODO. view3D is a misnomer. Should be renamed Object3D or similar.
	view3D() {
		return this._container;
	}
	
	getBoundingBox() {
		let min = new THREE.Vector3(-this._squareSize / 2, 0, this._squareSize / 2).add(this._container.position);
		
		let boardSizeX = this._squareSize * this._x();
		let boardSizeZ = this._squareSize * this._z();
		let max = new THREE.Vector3(boardSizeX, 
									this._deltaY * this._y(),
									-(boardSizeZ * this._w() + this._deltaW * (this._w() - 1))
								   ).add(min);
		
		return new THREE.Box3(min, max);
	}
	
	getCenter() {
		let boundingBox = this.getBoundingBox();
		let min = boundingBox.min.clone();
		let max = boundingBox.max.clone();
		
		return min.add(max).divideScalar(2);
	}
	
	_init() {
		// TODO: revive after testing fix for transparent objects (im trying to add the board last)
		let square = 25;
		this._checkerboards.add(checkerboard4D(this.dim, square, square * 3, square * 1.5));
		
		console.log('BoardGraphics', this._container);
	}
	
	_spawnMeshFromPiece(pieceObj, frames=0) {
		if (pieceObj.isEmpty()) {
			return null;
		}
		let material = pieceObj.team === ChessTeam.WHITE ? 'white' : 'black';
		let pos = this.to3D(pieceObj.x, pieceObj.y, pieceObj.z, pieceObj.w);
		let mesh = Models.createMesh(pieceObj.type, material, pos);
		let rotation = pieceObj.team === ChessTeam.WHITE ? 180 : 0;
		rotateObject(mesh, 0, rotation, 0);
		if (pieceObj.team === ChessTeam.WHITE) {
			this._white.add(mesh);
		} else if (pieceObj.team === ChessTeam.BLACK) {
			this._black.add(mesh);
		}
		// bind associated piece to mesh
		mesh.piece = pieceObj.id;
		
		this._idToMesh.set(pieceObj.id, mesh);
		this._idToPiece.set(pieceObj.id, pieceObj);
		
		if (frames) {
			return this._grow(mesh, frames);
		} else {
			return Promise.resolve();
		}
		
//		return mesh;
	}
	
	_spawnGhostMesh(id, move, preview) {
		let pieceObj = this.idToPiece(id);
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
		
		let scale = move.isCapture() ? 1 : 1;
		let opacity = move.isCapture() ? 0.99 : 0.7;
		let mesh = Models.createMesh(type, material, pos, scale, opacity);
		let rotation = team === ChessTeam.WHITE ? 180 : 0;
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
		this._highlight = new THREE.Group();
		this._pieces.add(this._white);
		this._pieces.add(this._black);
		this._pieces.add(this._ghost);
		this._pieces.add(this._highlight);
		
		pieces.flat(3).forEach(pieceObj => {
			this._spawnMeshFromPiece(pieceObj);
		});
		
		
		this._container.add(this._pieces);
	}
	
	showPossibleMoves(piece, moves, preview=false, frames=0) {
		
		let showAnimationProms = [];
		// hide moves if already showing
		let hideAnimationProms = this.hidePossibleMoves(piece, frames);
		let meshes = new Set();
		
		moves.forEach(move => {
			let mesh = this._spawnGhostMesh(piece, move, preview);
			
			if (frames) {
				let fadeInProm = this._fadeIn(mesh, frames);
				showAnimationProms.push(fadeInProm);
				if (move.isCapture()) {
					
				} else {
					let growInProm = this._grow(mesh, frames);
					showAnimationProms.push(growInProm);
				}
			} else {
				// else do nothing
			}
			meshes.add(mesh);
		});
		// TODO: is this even doing anything?
		this._showingMovesFor.set(piece.id, meshes);
		
		return Promise.all(showAnimationProms.concat([hideAnimationProms]));
	}
	
	hidePossibleMoves(piece, frames=0) {
		let meshes = this._showingMovesFor.get(piece.id);
		let hideAnimationProms = [];
		if (!meshes) {
			return Promise.resolve();
		}
		if (frames) {
			meshes.forEach(mesh => {
				let fadeOutProm = this._fadeOut(mesh, frames);
				hideAnimationProms.push(fadeOutProm);
				if (mesh.move.isCapture()) {
					
				} else {
					let shrinkOutProm = this._shrink(mesh, frames);
					hideAnimationProms.push(shrinkOutProm);
				}
				Promise.all(hideAnimationProms).then(() => {
					this._remove(mesh);
					meshes.delete(mesh); // I think we already do that here (see above)
				});
			});
			// TODO: remove meshes from _showingMovesFor?
		} else {
			this._remove(...meshes);
			meshes.forEach(mesh => meshes.delete(mesh));
		}
		return Promise.all(hideAnimationProms);
	}
	
	highlight(id, frames=0) {
		this.unhighlight(id, frames);
		let mesh = this._spawnHighlightMesh(id);
		if (frames) {
			this._fadeIn(mesh, frames);
		}
		this._highlightingFor.set(id, mesh);
	}
	
	unhighlight(id, frames=0) {
		let mesh = this._highlightingFor.get(id);
		if (!mesh) {
			return;
		}
		if (frames) {
			this._fadeOut(mesh, frames).then(() => {
				this._remove(mesh);
				// TODO: somehow having this here breaks?
				// this._highlightingFor.delete(piece);
			});
			this._highlightingFor.delete(id);
		} else {
			this._remove(mesh);
			this._highlightingFor.delete(id);
		}
	}
	
	_spawnHighlightMesh(id) {
		let pieceObj = this.idToPiece(id);
		let pos = this.to3D(pieceObj.x, pieceObj.y, pieceObj.z, pieceObj.w);
		let team = pieceObj.team;
		let type = pieceObj.type;
		let material = 'blue';
		let scale = 1;
		let mesh = Models.createMesh(type, material, pos, scale);
		let rotation = team === ChessTeam.WHITE ? 180 : 0;
		rotateObject(mesh, 0, rotation, 0);
		this._highlight.add(mesh);
		// Fixes issue with transparent board hiding transparent pieces
		// https://discourse.threejs.org/t/material-transparency-problem/3822
//		mesh.material.depthWrite = false;
		console.log(mesh)
		return mesh;		
	}
	
	rayCast(rayCaster, targetTeam=ChessTeam.OMNISCIENT) {
		
		if (!this._canInteract) {
			return null;
		}
		
		let group;
		let candidates = [];
		
		if (targetTeam.permissions.get(ChessTeam.WHITE)) {
			candidates = candidates.concat(this._white.children);
		}
		if (targetTeam.permissions.get(ChessTeam.BLACK)) {
			candidates = candidates.concat(this._black.children);
		}
		if (targetTeam.permissions.get(ChessTeam.GHOST)) {
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
		
		let moveAnimationProm;
		
		// Is this necessary?
//		let hidePossibleMovesProm = this.hideAllPossibleMoves(6);
		
		// IMPORTANT: Need to wait until ghost meshes disappear until reenabling
		this._disableInteraction();
		
		if (frames) {
			let mesh = this.idToMesh(move.piece.id);
			let startPos = this.to3D(move.x0, move.y0, move.z0, move.w0);
			let endPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
			let capturedMesh = this.idToMesh(move.capturedPiece.id);
			
			let movingPieceProm = this._translate(mesh, frames, startPos, endPos)
				.then(() => {
					// TODO:
					// this._remove(capturedMesh);
					if (move.promotionNew) {
						return this._shrink(mesh, config.animFrames.shrinkGrow);
					} else {
						// End promise chain (Do nothing)
						// TODO: how to end a promise chain properly?
						return Promise.reject();
					}
				})
				.then(() => {
					// TODO: 
					// this._remove(mesh);
					return this._spawnMeshFromPiece(move.promotionNew, config.animFrames.shrinkGrow);
				}, () => { /* Do nothing */ });
			
			let capturedPieceProm = Promise.resolve();
			if (capturedMesh) {
				capturedPieceProm = this._shrink(capturedMesh, frames);
			}
			moveAnimationProm = Promise.all([movingPieceProm, capturedPieceProm]);
			
		} else {
			let mesh = this.idToMesh(move.piece.id);
			let capturedMesh = this.idToMesh(move.capturedPiece.id);

			let newPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
			mesh.position.set(newPos.x, newPos.y, newPos.z);
			// TODO:
			// this._remove(capturedMesh);

			if (move.promotionNew) {
				// TODO:
				// this._remove(mesh);
				return this._spawnMeshFromPiece(move.promotionNew);
			}
			moveAnimationProm = Promise.resolve();
		}
		
//		Promise.all([moveAnimationProm]).then(() => {
//			this._enableInteraction();
//		});
		// Reenable interaction when all animations have finished
		this._allAnimProms.push(moveAnimationProm);
		Promise.all(this._allAnimProms).then(() => {
			this._enableInteraction();
		});
	}

	undoMove(move, frames=0) {
		// TODO: Spamming undo button will make animations overlap. Can break if 
		// first undo animation is longer than second undo animation.
		let undoAnimationProm;
		this._disableInteraction();
		if (frames) {
			let mover = this.idToMesh(move.piece.id);
			let startPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
			let endPos = this.to3D(move.x0, move.y0, move.z0, move.w0);
			let restoringMoverProm = Promise.resolve();
			if (move.promotionNew) {
				// If the original piece was promoted, then we need to get it back
				// and remove the promoted mesh
				let promotedMesh = this.idToMesh(move.promotionNew.id);
				restoringMoverProm = this._shrink(promotedMesh, config.animFrames.shrinkGrow)
					.then(() => {
						return this._grow(mover, config.animFrames.shrinkGrow);
					});
			}
			
			
			undoAnimationProm = restoringMoverProm.then(() => {
				let translateProm = this._translate(mover, frames, startPos, endPos);
				let capturedGrowProm = Promise.resolve();
				if (move.isCapture()) {
					let capturedMesh = this.idToMesh(move.capturedPiece.id);
					capturedGrowProm = this._grow(capturedMesh, frames);
				}
				return Promise.all([translateProm, capturedGrowProm]);
			});

			// TODO: is this promise resolved when the restoringMoverProm chain is complete, or...?
			// undoAnimationProm = restoringMoverProm;
			
		} else {

		}

		this._allAnimProms.push(undoAnimationProm);
		Promise.all(this._allAnimProms).then(() => {
			this._enableInteraction();
		});
	}

	explainAll(attackers) {
		attackers.forEach(attacker => {
			let mesh = this.idToMesh(attacker.id);
			this._blink(mesh, config.animFrames.explain);
		})
	}
	
	_remove(mesh) {
		// Do not remove from _pieceToMesh or else we will lose 
		// it forever and wont be able to undo moves graphically
		this._white.remove(mesh);
		this._black.remove(mesh);
		this._ghost.remove(mesh);
		this._highlight.remove(mesh);
	}
	
	_translate(mesh, numFrames, startPos, endPos) {
		let animation = Animation.translate(Animation.POLYNOMIAL(3), mesh, startPos, endPos, numFrames);
		let promise = this._animator.animate(animation);
		this._allAnimProms.push(promise);
		return promise;
	}
	
	_shrink(mesh, numFrames) {
		let animation = Animation.scale(Animation.LINEAR, mesh, mesh.scale.x, 0, numFrames);
		let promise = this._animator.animate(animation);
		// TODO: Spamming undo button will make animations overlap. Can break if 
		// first undo animation is longer than second undo animation.
		this._allAnimProms.push(promise);
		return promise;
	}
	
	_grow(mesh, numFrames) {
		let animation = Animation.scale(Animation.LINEAR, mesh, 0, mesh.originalScale, numFrames);
		// TODO: Spamming undo button will make animations overlap. Can break if 
		// first undo animation is longer than second undo animation.
		animation.override = true;
		let promise = this._animator.animate(animation);
		this._allAnimProms.push(promise);
		return promise;
	}
	
	_fadeIn(mesh, numFrames) {
		// Assumes mesh.material.transparent
		// mode, mesh, startOpacity, endOpacity, numFrames, onFinishCallback
		let animation = Animation.opacity(Animation.QUADRATIC, mesh, 0, mesh.material.originalOpacity, numFrames);
		animation.override = true;
		
		let promise = this._animator.animate(animation);
		this._allAnimProms.push(promise);
		return promise;
	}
	
	_fadeOut(mesh, numFrames) {
		// Assumes mesh.material.transparent
		let animation = Animation.opacity(Animation.QUADRATIC, mesh, mesh.material.opacity, 0, numFrames);
		animation.override = true;
		
		let promise = this._animator.animate(animation);
		this._allAnimProms.push(promise);
		return promise;
	}
	
	_blink(mesh, numFrames) {
		let animation = Animation.blink(Animation.GEN_COS(3), mesh, Models.materials.red.color, numFrames);
		animation.override = true;
		let promise = this._animator.animate(animation);
		this._allAnimProms.push(promise);
		return promise;
	}
}

export default BoardGraphics3D;