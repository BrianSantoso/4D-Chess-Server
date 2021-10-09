"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BoardGraphics_js_1 = tslib_1.__importDefault(require("./BoardGraphics.js"));
const THREE = tslib_1.__importStar(require("three"));
const Animator_js_1 = tslib_1.__importStar(require("./Animator.js"));
const Utils3D_js_1 = require("./Utils3D.js");
const Models_js_1 = tslib_1.__importDefault(require("./Models.js"));
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
const config_json_1 = tslib_1.__importDefault(require("./config.json"));
const Piece_js_1 = tslib_1.__importDefault(require("./Piece.js"));
// TODO: update graphics hierarchy
// BoardGrahpics
//    -> Graphics3D
//    -> NullGrahpics
class BoardGraphics3D extends BoardGraphics_js_1.default {
    constructor() {
        super();
        this.dim;
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
        this._animator = new Animator_js_1.default();
        this._allAnimProms = [];
        this._squareSize = 25;
        this._deltaY = this._squareSize * 2.8;
        this._deltaW = this._squareSize * 1.5;
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
        return new THREE.Vector3(x * this._squareSize, y * this._deltaY, -newZ).add(this._container.position);
    }
    idToMesh(id) {
        let mesh = this._idToMesh.get(id);
        if (!mesh) {
            let piece = this.idToPiece(id);
            this._spawnMeshFromPiece(piece, 0);
            mesh = this._idToMesh.get(id);
        }
        return mesh;
    }
    idToPiece(id) {
        if (id === undefined) {
            return new Piece_js_1.default();
        }
        return this._idToPiece.get(id);
    }
    update() {
        this._animator.update();
    }
    canInteract() {
        return this._canInteract;
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
        let max = new THREE.Vector3(boardSizeX, this._deltaY * this._y(), -(boardSizeZ * this._w() + this._deltaW * (this._w() - 1))).add(min);
        return new THREE.Box3(min, max);
    }
    getCenter() {
        let boundingBox = this.getBoundingBox();
        let min = boundingBox.min.clone();
        let max = boundingBox.max.clone();
        return min.add(max).divideScalar(2);
    }
    init(dims) {
        this.dim = dims;
        // TODO: revive after testing fix for transparent objects (im trying to add the board last)
        this._checkerboards.add(Utils3D_js_1.checkerboard4D(this.dim, this._squareSize, this._deltaY, this._deltaW));
        console.log('BoardGraphics', this._container);
    }
    _spawnMeshFromPiece(pieceObj, frames = 0) {
        if (pieceObj.isEmpty()) {
            return null;
        }
        let material = pieceObj.team === ChessTeam_js_1.default.WHITE ? 'white' : 'black';
        let pos = this.to3D(pieceObj.x, pieceObj.y, pieceObj.z, pieceObj.w);
        let mesh = Models_js_1.default.createMesh(pieceObj.type, material, pos);
        let rotation = pieceObj.team === ChessTeam_js_1.default.WHITE ? 180 : 0;
        Utils3D_js_1.rotateObject(mesh, 0, rotation, 0);
        if (pieceObj.team === ChessTeam_js_1.default.WHITE) {
            this._white.add(mesh);
        }
        else if (pieceObj.team === ChessTeam_js_1.default.BLACK) {
            this._black.add(mesh);
        }
        // bind associated piece to mesh
        mesh.pieceId = pieceObj.id;
        this._idToMesh.set(pieceObj.id, mesh);
        if (frames) {
            return this._grow(mesh, frames);
        }
        else {
            return Promise.resolve();
        }
        //		return mesh;
    }
    _spawnGhostMesh(id, move, preview) {
        // TODO: id is not needed, just move?
        let pieceObj = this.idToPiece(id);
        let capturedPiece = this.idToPiece(move.capturedPieceId);
        let pos = this.to3D(move.x1, move.y1, move.z1, move.w1);
        let team = pieceObj.team;
        let type = pieceObj.type;
        if (!capturedPiece.isEmpty()) {
            team = capturedPiece.team;
            type = capturedPiece.type;
        }
        let material; // TODO: implement some sort of materials scheme. this is kind of messy
        if (preview) {
            material = capturedPiece.isEmpty() ? 'lightGray' : 'darkGray';
        }
        else {
            if (capturedPiece.isEmpty()) {
                if (team === ChessTeam_js_1.default.WHITE) {
                    material = 'lightGray';
                }
                else {
                    material = 'darkGray';
                }
            }
            else {
                material = 'orange';
            }
            // material = capturedPiece.isEmpty() ? 'lightGray' : 'orange';
        }
        let scale = move.isCapture() ? 1 : 1;
        let opacity = move.isCapture() ? 0.99 : 0.6;
        let mesh = Models_js_1.default.createMesh(type, material, pos, scale, opacity);
        let rotation = team === ChessTeam_js_1.default.WHITE ? 180 : 0;
        Utils3D_js_1.rotateObject(mesh, 0, rotation, 0);
        this._ghost.add(mesh);
        mesh.move = move;
        // Fixes issue with transparent board hiding transparent pieces
        // https://discourse.threejs.org/t/material-transparency-problem/3822
        //		mesh.material.depthWrite = false;
        return mesh;
    }
    spawnPieces(pieces, allPieces) {
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
        allPieces.forEach(pieceObj => {
            this._idToPiece.set(pieceObj.id, pieceObj);
        });
        this._container.add(this._pieces);
    }
    showPossibleMoves(piece, moves, preview = false, frames = 0) {
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
                }
                else {
                    let growInProm = this._grow(mesh, frames);
                    showAnimationProms.push(growInProm);
                }
            }
            else {
                // else do nothing
            }
            meshes.add(mesh);
        });
        // TODO: is this even doing anything?
        this._showingMovesFor.set(piece.id, meshes);
        return Promise.all(showAnimationProms.concat([hideAnimationProms]));
    }
    hidePossibleMoves(piece, frames = 0) {
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
                }
                else {
                    let shrinkOutProm = this._shrink(mesh, frames);
                    hideAnimationProms.push(shrinkOutProm);
                }
                Promise.all(hideAnimationProms).then(() => {
                    this._remove(mesh);
                    meshes.delete(mesh); // I think we already do that here (see above)
                });
            });
            // TODO: remove meshes from _showingMovesFor?
        }
        else {
            this._remove(...meshes);
            meshes.forEach(mesh => meshes.delete(mesh));
        }
        return Promise.all(hideAnimationProms);
    }
    highlight(id, frames = 0) {
        this.unhighlight(id, frames);
        let mesh = this._spawnHighlightMesh(id);
        if (frames) {
            this._fadeIn(mesh, frames);
        }
        this._highlightingFor.set(id, mesh);
    }
    unhighlight(id, frames = 0) {
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
        }
        else {
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
        let mesh = Models_js_1.default.createMesh(type, material, pos, scale);
        let rotation = team === ChessTeam_js_1.default.WHITE ? 180 : 0;
        Utils3D_js_1.rotateObject(mesh, 0, rotation, 0);
        this._highlight.add(mesh);
        // Fixes issue with transparent board hiding transparent pieces
        // https://discourse.threejs.org/t/material-transparency-problem/3822
        //		mesh.material.depthWrite = false;
        return mesh;
    }
    rayCast(rayCaster, targetTeam = ChessTeam_js_1.default.OMNISCIENT) {
        if (!this.canInteract()) {
            return null;
        }
        let group;
        let candidates = [];
        if (targetTeam.permissions.get(ChessTeam_js_1.default.WHITE)) {
            candidates = candidates.concat(this._white.children);
        }
        if (targetTeam.permissions.get(ChessTeam_js_1.default.BLACK)) {
            candidates = candidates.concat(this._black.children);
        }
        if (targetTeam.permissions.get(ChessTeam_js_1.default.GHOST)) {
            candidates = candidates.concat(this._ghost.children);
        }
        let intersects = rayCaster.intersectObjects(candidates);
        if (intersects.length > 0) {
            return intersects[0].object;
        }
        else {
            return null;
        }
    }
    makeMove(move, frames = 0) {
        let moveAnimationProm;
        // Is this necessary?
        //		let hidePossibleMovesProm = this.hideAllPossibleMoves(6);
        // IMPORTANT: Need to wait until ghost meshes disappear until reenabling
        this._disableInteraction();
        if (frames) {
            let mesh = this.idToMesh(move.pieceId);
            let startPos = this.to3D(move.x0, move.y0, move.z0, move.w0);
            let endPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
            let capturedMesh = this.idToMesh(move.capturedPieceId);
            let movingPieceProm = this._translate(mesh, frames, startPos, endPos)
                .then(() => {
                // TODO:
                // this._remove(capturedMesh);
                if (move.promotionNew) {
                    return this._shrink(mesh, config_json_1.default.animFrames.shrinkGrow);
                }
                else {
                    // End promise chain (Do nothing)
                    // TODO: how to end a promise chain properly?
                    return Promise.reject();
                }
            })
                .then(() => {
                // TODO: 
                // this._remove(mesh);
                return this._spawnMeshFromPiece(move.promotionNew, config_json_1.default.animFrames.shrinkGrow);
            }, () => { });
            let capturedPieceProm = Promise.resolve();
            if (capturedMesh) {
                capturedPieceProm = this._shrink(capturedMesh, frames);
            }
            moveAnimationProm = Promise.all([movingPieceProm, capturedPieceProm]);
        }
        else {
            let mesh = this.idToMesh(move.pieceId);
            let capturedMesh = this.idToMesh(move.capturedPieceId);
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
    undoMove(move, frames = 0) {
        // TODO: Spamming undo button will make animations overlap. Can break if 
        // first undo animation is longer than second undo animation.
        let undoAnimationProm;
        this._disableInteraction();
        if (frames) {
            let mover = this.idToMesh(move.pieceId);
            let startPos = this.to3D(move.x1, move.y1, move.z1, move.w1);
            let endPos = this.to3D(move.x0, move.y0, move.z0, move.w0);
            let restoringMoverProm = Promise.resolve();
            if (move.promotionNew) {
                // If the original piece was promoted, then we need to get it back
                // and remove the promoted mesh
                // Fix to issue: https://github.com/BrianSantoso/4D-Chess-Server/issues/9
                mover.position.set(startPos.x, startPos.y, startPos.z);
                mover.scale.set(0, 0, 0);
                let promotedMesh = this.idToMesh(move.promotionNew.id);
                restoringMoverProm = this._shrink(promotedMesh, config_json_1.default.animFrames.shrinkGrow)
                    .then(() => {
                    return this._grow(mover, config_json_1.default.animFrames.shrinkGrow);
                });
            }
            undoAnimationProm = restoringMoverProm.then(() => {
                let translateProm = this._translate(mover, frames, startPos, endPos);
                let capturedGrowProm = Promise.resolve();
                if (move.isCapture()) {
                    let capturedMesh = this.idToMesh(move.capturedPieceId);
                    capturedGrowProm = this._grow(capturedMesh, frames);
                }
                return Promise.all([translateProm, capturedGrowProm]);
            });
            // TODO: is this promise resolved when the restoringMoverProm chain is complete, or...?
            // undoAnimationProm = restoringMoverProm;
        }
        else {
        }
        this._allAnimProms.push(undoAnimationProm);
        Promise.all(this._allAnimProms).then(() => {
            this._enableInteraction();
        });
    }
    explainAll(attackers) {
        attackers.forEach(attacker => {
            let mesh = this.idToMesh(attacker.id);
            this._blink(mesh, config_json_1.default.animFrames.explain);
        });
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
        let animation = Animator_js_1.Animation.translate(Animator_js_1.Animation.POLYNOMIAL(3), mesh, startPos, endPos, numFrames);
        let promise = this._animator.animate(animation);
        this._allAnimProms.push(promise);
        return promise;
    }
    _shrink(mesh, numFrames) {
        let animation = Animator_js_1.Animation.scale(Animator_js_1.Animation.LINEAR, mesh, mesh.scale.x, 0, numFrames);
        let promise = this._animator.animate(animation);
        // TODO: Spamming undo button will make animations overlap. Can break if 
        // first undo animation is longer than second undo animation.
        this._allAnimProms.push(promise);
        return promise;
    }
    _grow(mesh, numFrames) {
        let animation = Animator_js_1.Animation.scale(Animator_js_1.Animation.LINEAR, mesh, 0, mesh.originalScale, numFrames);
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
        let animation = Animator_js_1.Animation.opacity(Animator_js_1.Animation.QUADRATIC, mesh, 0, mesh.material.originalOpacity, numFrames);
        animation.override = true;
        let promise = this._animator.animate(animation);
        this._allAnimProms.push(promise);
        return promise;
    }
    _fadeOut(mesh, numFrames) {
        // Assumes mesh.material.transparent
        let animation = Animator_js_1.Animation.opacity(Animator_js_1.Animation.QUADRATIC, mesh, mesh.material.opacity, 0, numFrames);
        animation.override = true;
        let promise = this._animator.animate(animation);
        this._allAnimProms.push(promise);
        return promise;
    }
    _blink(mesh, numFrames) {
        let animation = Animator_js_1.Animation.blink(Animator_js_1.Animation.GEN_COS(3), mesh, Models_js_1.default.materials.red.color, numFrames);
        animation.override = true;
        let promise = this._animator.animate(animation);
        this._allAnimProms.push(promise);
        return promise;
    }
}
exports.default = BoardGraphics3D;
//# sourceMappingURL=BoardGraphics3D.js.map