import * as THREE from "three";
import ChessGame from "./ChessGame.js";
import SceneManager from "./SceneManager.js";
//import View2D from "./View2D";

class GameManager {
	constructor() {
		this._view2D = null;
		// TODO: Pass DOM Element to contain threejs canvas.
		this._view3D = new SceneManager(document.getElementById("gameManager")); 
		
		let game = new ChessGame(4);
		this.setGame(game);
		
		this._controller = null;
	}
	
	setGame(game) {
		
		if (this._game) {
			// Decouple current game from Scene Manager
			this._view3D.remove(this._game.view3D());
		}
		
		this._game = game;
		this._view3D.add(game.view3D());
	}
	
	_keyInputs() {
		this._view3D.keyInputs();
	}
	
	_update() {
		
	}
	
	_draw() {
		this._view3D.draw();
	}
	
	_startLoop() {
		let last = 0;
		let now = window.performance.now();
		let dt;
		let accumulation = 0;
		const step = 1/60; // update simulation every 1/60 of a second (60 fps)
		
		let frame = () => {
			now = window.performance.now(); // store the time when the new frame starts
			dt = now - last; // calculate the amount of time the last frame took
			accumulation += Math.min(1, dt/1000);	// increase accumulation by the amount of time the last frame took and limit accumulation time to 1 second.

			// KEY INPUTS
			this._keyInputs();

			// if the accumulated time is larger than the fixed time-step, continue to
			// update the simulation until it is caught up to real time
			while(accumulation >= step){
				// UPDATE
				this._update();
				accumulation -= step;
			}
			
			// DRAW
			this._draw();

			last = now;
			requestAnimationFrame(frame); // repeat the loop
		}
		requestAnimationFrame(frame);
	}
}

export default GameManager;