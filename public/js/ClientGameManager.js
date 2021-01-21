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
import jwt from 'jsonwebtoken';

class ClientGameManager extends GameManager {
	constructor(client) {
		super();
		// this._domElement = document.getElementById("embed");
		this._authToken = '';
		this._view3D = new SceneManager();
        this._controller = null;
		this._client = client;
		this._clientTeam = ChessTeam.SPECTATOR;
		this._room = null;
		this._view2D = new View2D(this, this._client);

		this._focus = '';

		this.setAuthToken = this.setAuthToken.bind(this);

		const proms = [this.loadAssets(), new Promise((resolve, reject) => {
			this._authTokenSet = resolve;
		})]
		Promise.all(proms).then(() => {
			try {
				let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/)[1];
				this.join(roomId);
			} catch {
				console.log('[App] No roomId parameter found');
				this.join('standard');
			}
			this._startLoop();
		});
	}

	setAuthToken(token) {
		// TODO: may error if authToken is unloaded (via logout!)
		//  and user tries to join room before a new guest 
		// token can be retrieved from the server
		this._authToken = token;
		this._authTokenSet();
	}

	setFocus(focus) {
		this._focus = focus;
		this._view2D.setFocus(focus);
	}

	mount(root) {
		this._view3D.mount(root);
	}

	overlay() {
		return this._view2D.overlay();
	}

	async join(roomName) {
		try {
			let room = await this._client.joinOrCreate(roomName, {
				authToken: this._authToken
			});
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

		room.onMessage('move', (data) => {
			let move = Move.revive(data.move);
			// TODO: Can optimize by instead, receiving precomputed
			// moveData from server. This would remove the need
			// to calculate possibleMovesBefore/After + status
			// on the client side.
			this.makeMove(move);

			this.setPlayerData(data.playerData);
		});

		// TODO: change to gameAssignment
		room.onMessage('chessGame', (jsonData) => {
			console.log('received chessGame');
			this.loadFrom(jsonData);
		});

		room.onMessage('playerData', (jsonData) => {
			console.log('received playerData');
			this.setPlayerData(jsonData);
		})

		if (this._room) {
			this._room.leave();
		}
		this._room = room;
		this._view2D.setRoom(room);

		if (this._game) {
			this._game.setRoom(room);
		}
	}

	setPlayerData(playerData) {
		super.setPlayerData(playerData);

		let decoded = jwt.decode(this._authToken, {complete: true});
		let clientId = decoded.payload._id;
		if (clientId === playerData._white._id) {
			this._clientTeam = ChessTeam.WHITE;
		} else if (clientId === playerData._black._id) {
			this._clientTeam = ChessTeam.BLACK;
		} else {
			this._clientTeam = ChessTeam.SPECTATOR;
		}
		this._game.setPlayerControls(this.getClientTeam());
		this.subscribePlayers();
		
		
		// TODO: whose turn is it bruh
		this._view2D.setPlayerData(playerData, this.getClientTeam());
	}

	getClientTeam() {
		return this._clientTeam;
	}

	setGame(game) {
		
		if (this._game) {
			// Decouple current game from Scene Manager
			this._view3D.remove(this.view3D());
			// TODO: unsubscribe current game from mouse event handlers
			this._game.getPlayers().forEach(player => {
				if (player.needsClickEvent()) {
					// TODO: is there a prettier way to do this?
					this._view3D.unsubscribe(player, 'intentionalClick');
				}
			});
		}
		
		super.setGame(game);

		this._view3D.add(game.view3D());
		this._view3D.configureCamera(game._boardGraphics, ChessTeam.WHITE);
		
		// manage subscriptions
		this.subscribePlayers();
	}

	subscribePlayers() {
		this._game.getPlayers().forEach(player => {
			if (player.needsClickEvent()) {
				// TODO: is there a prettier way to do this?
				this._view3D.subscribe(player, 'intentionalClick');
			}
		});
		this._game.getPlayers().forEach(player => {
			if (player.needsRayCaster()) {
				player.setRayCaster(this._view3D.getRayCaster());
			}
		});
	}
	
	createGame(options) {
        let defaultOptions = {
			// mode: ChessMode.NONE,
			boardConfig: null,
			BoardGraphics: BoardGraphics3D,
			whitePlayerType: 'AbstractPlayer',
			blackPlayerType: 'AbstractPlayer'
		}
        options = Object.assign(defaultOptions, options);
		let game = super.createGame(options);
		game.setRoom(this._room);
		game.setNeedsValidation(true); // TODO: this is temporary, change to false later!
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
			let playerData = this.getPlayerData();
			this._view2D.setPlayerData(playerData, this.getClientTeam());
			// this.setPlayerData(playerData); // updates view2d with redundant side effect of setting game playerdata to itself
		}
		this._view3D.update();
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
		// this.props.gameManager.loadAssets().then(() => {
		// 	try {
		// 		let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/)[1];
		// 		this.props.gameManager.join(roomId);
		// 	} catch {
		// 		console.log('[App] No roomId parameter found');
		// 		this.props.gameManager.join('standard');
		// 	}

		// 	this.props.gameManager._startLoop();
		// });
	}

	componentDidMount() {
		// Mount three.js canvas
		this.props.gameManager.mount(this._root);
		this.props.onMount();
	}

	render() {
		let maximized = this.props.focus !== 'minimized';
		this.props.gameManager.setFocus(this.props.focus);
		return (
			<div id="embedPositioner">
				<div id="embed" className={maximized ? 'embed-maximized' : 'embed-minimized'} ref={(ref) => (this._root = ref)}>
					{this.props.gameManager.overlay()}
				</div>
			</div>
		);
	}
}
export { ClientGameManager, Embed }