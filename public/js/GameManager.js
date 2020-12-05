import * as THREE from "three"
import SceneManager from "./SceneManager.js";
import Models from "./Models.js";
import ChessGame from "./ChessGame.js";
import { Player3D } from "./ChessPlayer.js";
import BoardGraphics from "./BoardGraphics.js";
import View2D from "./View2D.jsx";

class GameManager {
	constructor() {
		
	}
	
	setGame(game) {
		this._game = game;
	}
	
	createGame(config) {
		// Factory to create game, instantiating and injecting required dependencies
		let defaultConfig = {
			dim: [4, 4, 4, 4],
			BoardGraphics: BoardGraphics,
			WhitePlayer: Player3D,
			BlackPlayer: Player3D
		}
		config = Object.assign(defaultConfig, config);
		
		let game = new ChessGame(config.dim);
		
		let boardGraphics = new config.BoardGraphics(config.dim);
		game.setBoardGraphics(boardGraphics);
		
		let white = new config.WhitePlayer(ChessGame.WHITE, game);
		let black = new config.BlackPlayer(ChessGame.BLACK, game);
		game.setWhite(white);
		game.setBlack(black);
		
		return game;
		// TODO: set controllers and subscriptions, etc.
	}
}

class ClientGameManager extends GameManager {
	constructor() {
		super();
		this._domElement = document.getElementById("embed");
		this._view2D = new View2D(this);
		this._view3D = new SceneManager(this._domElement);
		
		this._controller = null;
		
	}
	
	setGame(game) {
		
		if (this._game) {
			// Decouple current game from Scene Manager
			this._view3D.remove(this._game.view3D());
			// TODO: unsubscribe current game from mouse event handlers
			this._game.getPlayers().forEach(player => {
				if (player.needsClickEvent()) {
					// TODO: is there a prettier way to do this?
					this._view3D.unsubscribe(player, 'intentionalClick');
				}
			});
		}
		
		// TODO: Is this structure okay to assume since this is a 3D game manager?
		this._view3D.add(game._boardGraphics.view3D());
		this._view3D.configureCamera(game._boardGraphics, ChessGame.WHITE);
		
		super.setGame(game);
		
		// manage subscriptions
		game.getPlayers().forEach(player => {
			if (player.needsClickEvent()) {
				// TODO: is there a prettier way to do this?
				this._view3D.subscribe(player, 'intentionalClick');
			}
		});
	}
	
	createGame(config) {
		let game = super.createGame(config);
		game.getPlayers().forEach(player => {
			if (player.needsRayCaster()) {
				player.setRayCaster(this._view3D.getRayCaster());
			}
		});
		return game;
	}
	
	cameraHome() {
		this._view3D.configureCamera(this._game._boardGraphics, ChessGame.WHITE, 0);
	}

	undo() {
		this._game.undo();
	}

	redo() {
		this._game.redo();
	}
	
	loadAssets() {
		let modelsPromise = Models.loadModels();
		return Promise.all([modelsPromise]);
	}
	
	_keyInputs() {
		this._view3D.keyInputs();
	}
	
	_update() {
		this._game.update();
		this._view3D.update();
	}
	
	_draw() {
		this._view3D.draw();
		this._view2D.draw();
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
export { ClientGameManager }