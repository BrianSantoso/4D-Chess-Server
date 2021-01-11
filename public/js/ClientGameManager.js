import GameManager from "./GameManager.js";
import config from "./config.json";
import BoardGraphics3D from "./BoardGraphics3D.js";
import { LocalPlayer3D, OnlinePlayer3D, Spectator3D } from "./ChessPlayer.js";
import ChessTeam from "./ChessTeam.js";
import Move from "./Move.js";
import SceneManager from "./SceneManager.js";
import Models from "./Models.js";
import View2D from "./View2D.jsx";
import ChessGame, { ChessMode } from "./ChessGame.js";
import games from "./Games.json";

import React, { Component } from "react";
import * as Colyseus from "colyseus.js";

class ClientGameManager extends GameManager {
	constructor(client) {
		super();
		// this._domElement = document.getElementById("embed");
		
		this._view3D = new SceneManager();
        this._controller = null;
		this._client = client;
		this._room = null;
		this._view2D = new View2D(this, this._client);

		this._focused = false;
	}

	setFocus(bool) {
		this._focused = bool;
	}

	mount(root) {
		this._view3D.mount(root);
	}

	overlay() {
		return this._view2D.overlay();
	}

	async join(roomName) {
		try {
			let room = await this._client.joinOrCreate(roomName, {/* options */});
			this.setRoom(room);
			console.log("[ClientGameManager] Joined room succesfully", room);

			// this._room.send('move', new Pawn())
		} catch (e) {
			console.error("[ClientGameManager] Join error", e);
		}
	}
	
	setRoom(room) {
		room.onMessage('chatMsg', (message) => {
			this._view2D.addMsg(message);
		});

		room.onMessage('move', (moveJSON) => {
			let move = Move.revive(moveJSON);
			this.makeMove(move);
		});

		// TODO: change to gameAssignment
		room.onMessage('chessGame', (jsonData) => {
			console.log('received chessGame')
			this.loadFrom(jsonData);
		});

		if (this._room) {
			this._room.leave();
		}
		this._room = room;
		this._view2D.setRoom(room);

		if (this._game) {
			this._game.setRoom(room);
		}
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
		game._boardGraphics.spawnPieces(game._board.getPieces(), game._board.allPieces());
		this._view3D.add(game._boardGraphics.view3D());
		this._view3D.configureCamera(game._boardGraphics, ChessTeam.WHITE);
		
		super.setGame(game);
		
		// manage subscriptions
		game.getPlayers().forEach(player => {
			if (player.needsClickEvent()) {
				// TODO: is there a prettier way to do this?
				this._view3D.subscribe(player, 'intentionalClick');
			}
		});
	}
	
	createGame(options) {
        let defaultOptions = {
			// mode: ChessMode.NONE,
			dim: config.dims.standard,
			BoardGraphics: BoardGraphics3D,
			WhitePlayer: OnlinePlayer3D, // TODO: configure players dynamically
			BlackPlayer: OnlinePlayer3D
		}
        options = Object.assign(defaultOptions, options);
		let game = super.createGame(options);
		game.setRoom(this._room);
		game.getPlayers().forEach(player => {
			if (player.needsRayCaster()) {
				player.setRayCaster(this._view3D.getRayCaster());
			}
		});
		return game;
	}
	
	cameraHome() {
		this._view3D.configureCamera(this._game._boardGraphics, ChessTeam.WHITE, 0);
	}

	undo() {
		// let str = JSON.stringify(this._game);
		// console.log(str)
		// Set interactor's state to unselected
		this._game.getPlayers().forEach(player => {
			player.unselect();
		});
		super.undo();
	}

	redo() {
		// Set interactor's state to unselected
		this._game.getPlayers().forEach(player => {
			player.unselect();
		});
		super.redo();
	}
	
	loadAssets() {
		let modelsPromise = Models.loadModels();
		return Promise.all([modelsPromise]);
	}
	
	_keyInputs() {
		this._view3D.keyInputs();
	}
	
	_update(step) {
		if (this._game) {
			this._game.update(step);
		}
		this._view3D.update();
	}
	
	_draw() {
		this._view3D.draw();
		// this._view2D.draw();
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
				this._update(step);
				accumulation -= step;
			}
			
			// DRAW
			this._draw();

			last = now;
			requestAnimationFrame(frame); // repeat the loop
		}
		requestAnimationFrame(frame);
	}

	debugLoad(event) {
		this.loadFrom(games.basic);
	}

	debugExport(event) {
		console.log(JSON.stringify(this._game))
	}
}

class Embed extends Component {
	constructor(props) {
		super(props)

		this._client = new Colyseus.Client("ws://localhost:3000");
		this._gameManager = new ClientGameManager(this._client);
		
		this._gameManager.loadAssets().then(() => {
			try {
				let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/)[1];
				this._gameManager.join(roomId);
			} catch {
				console.log('[App] No roomId parameter found');
				this._gameManager.join('standard');
			}

			this._gameManager._startLoop();
		});
	}

	componentDidMount() {
		// Mount three.js canvas
		this._gameManager.mount(this._root);
	}

	render() {
		this._gameManager.setFocus(this.props.focus);
		return (
			<div id="embed" ref={(ref) => (this._root = ref)}>
				{this._gameManager.overlay()}
			</div>
		);
	}
}
export { ClientGameManager, Embed }