"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const GameManager_js_1 = tslib_1.__importDefault(require("./GameManager.js"));
const BoardGraphics3D_js_1 = tslib_1.__importDefault(require("./BoardGraphics3D.js"));
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
const MoveHistory_js_1 = require("./MoveHistory.js");
const SceneManager_js_1 = tslib_1.__importDefault(require("./SceneManager.js"));
const RoomData_js_1 = tslib_1.__importDefault(require("./RoomData.js"));
const Models_js_1 = tslib_1.__importDefault(require("./Models.js"));
const Games_json_1 = tslib_1.__importDefault(require("./Games.json"));
const react_bootstrap_1 = require("react-bootstrap");
const react_1 = tslib_1.__importStar(require("react"));
const View2D_js_1 = tslib_1.__importDefault(require("./View2D.js"));
const Colyseus = tslib_1.__importStar(require("colyseus.js"));
class ClientGameManager extends GameManager_js_1.default {
    constructor(authenticator) {
        super();
        this._client = new Colyseus.Client("ws://localhost:3000");
        this._room = null;
        this._view3D = new SceneManager_js_1.default(); // initialized on mount
        this._controller = null;
        this._view2D = View2D_js_1.default.create('Overlay');
        // this._focusState = null;
        this._ready = [
            this.loadAssets(),
            new Promise((resolve, reject) => {
                this._authTokenSet = resolve;
            }),
            new Promise((resolve, reject) => {
                this._mounted = resolve;
            })
        ];
        Promise.all(this._ready).then(() => {
            try {
                let roomId = location.href.match(/roomId=([a-zA-Z0-9\-_]+)/)[1];
                this.join(roomId);
            }
            catch (_a) {
                console.log('[App] No roomId parameter found');
                this.join('standard'); // if authToken is unset (i.g. via logout), then joining is dangerous. Do not rely on promise.all after first join
            }
            this._startLoop();
        });
        this._authenticator = authenticator;
        if (this._authenticator) {
            this._authenticator.subscribe(this);
        }
    }
    onAccountChange() {
        this._authTokenSet();
    }
    getId() {
        return this._authenticator.getDecodedAuthToken('_id');
    }
    getClientTeam() {
        if (this._game) {
            let clientId = this.getId();
            return this._game.getTeam(clientId);
        }
        return null;
    }
    getClientRole() {
        if (this._game) {
            let clientId = this.getId();
            return this._game.getRole(clientId);
        }
        return null;
    }
    // TODO: is this even needed anymore? keyboard events already unsubscribe on component unmount
    // setFocus(focusState) {
    // 	this._focusState = focusState;
    // }
    mount(root) {
        this._view3D.mount(root);
        this._mounted();
    }
    view2D() {
        return View2D_js_1.default.unwrap(this._view2D);
    }
    async join(roomName) {
        // TODO: require that authtoken is set
        try {
            let room = await this._client.joinOrCreate(roomName, {
                authToken: this._authenticator.getAuthToken()
            });
            this.setRoom(room);
            console.log("[ClientGameManager] Joined room succesfully", room);
        }
        catch (e) {
            console.error("[ClientGameManager] Join error", e);
        }
    }
    setRoom(room) {
        // TODO: perhaps handle room leaving and joining from inside ChessGame?
        if (this._room) {
            this._room.leave();
        }
        // room needs to be saved as instance field because of the time between 
        // joining a room and receiving the game data needed to create the game
        super.setRoom(room);
        // TODO: Move this inside ChessGame, and use Object.assign(this, revive(data)) to restore?
        room.onMessage('chessGame', (jsonData) => {
            console.log('received chessGame');
            this.loadFrom(jsonData);
        });
    }
    setGame(game) {
        if (this._game) {
            // Decouple current game from Scene Manager
            this._view3D.remove(this.view3D());
            this.unsubscribePlayers();
        }
        super.setGame(game);
        game.initBoardGraphics();
        game.initGUI();
        // game.setRoom(this._room);
        this._view2D.setAddons(game.view2D()); // TODO: should remove addons when unmounting a game.
        this._view3D.add(game.view3D());
        this._view3D.configureCamera(game._boardGraphics, ChessTeam_js_1.default.WHITE);
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
    unsubscribePlayers() {
        this._game.getPlayers().forEach(player => {
            if (player.needsClickEvent()) {
                // TODO: is there a prettier way to do this?
                this._view3D.unsubscribe(player, 'intentionalClick');
            }
        });
    }
    createGame(options) {
        let defaultOptions = {
            // mode: ChessMode.NONE,
            boardConfig: null,
            BoardGraphics: BoardGraphics3D_js_1.default,
            whitePlayerType: 'AbstractPlayer',
            blackPlayerType: 'AbstractPlayer'
        };
        options = Object.assign(defaultOptions, options);
        let game = super.createGame(options);
        let room = this._room;
        game.setRoom(room, function configureMessageHandlers() {
            // Configure Client-side message handlers.
            room.onMessage('makeMove', (moveData) => {
                moveData = MoveHistory_js_1.MoveData.revive(moveData);
                // TODO: Can optimize by instead, receiving precomputed
                // moveData from server. This would remove the need
                // to calculate possibleMovesBefore/After + status
                // on the client side.
                this.makeMove(moveData.move, moveData.time, moveData.timestamp);
            });
            room.onMessage('syncMoveData', (moveData) => {
                moveData = MoveHistory_js_1.MoveData.revive(moveData);
                this.syncMoveData(moveData);
            });
            room.onMessage('roomData', (jsonData) => {
                console.log('received roomData', jsonData);
                let roomData = RoomData_js_1.default.revive(jsonData);
                console.log('Revived roomData:', roomData);
                this.syncRoomData(roomData);
            });
            room.onMessage('chatMsg', (message) => {
                this.chatMsg(message);
            });
        });
        game.setNeedsValidation(false); // TODO: this is temporary, change to false later!
        return game;
    }
    cameraHome() {
        this._view3D.configureCamera(this._game._boardGraphics, ChessTeam_js_1.default.WHITE, 0);
    }
    undo() {
        // TODO: move to a more appropriate place
        // Set interactor's state to unselected
        this._game.getPlayers().forEach(player => {
            player.unselect();
        });
        super.undo();
    }
    redo() {
        // TODO: move to a more appropriate place
        // Set interactor's state to unselected
        this._game.getPlayers().forEach(player => {
            player.unselect();
        });
        super.redo();
    }
    loadAssets() {
        let modelsPromise = Models_js_1.default.loadModels();
        return Promise.all([modelsPromise]);
    }
    getPeripherals(mode) {
        const peripherals = {
            'ONLINE_MULTIPLAYER': {
                gui: 'BasicOverlayAddons',
                controllers: {
                    player: 'OnlinePlayer3D',
                    opponent: 'AbstractPlayer3D',
                    spectator: 'AbstractPlayer3D'
                }
            },
            'LOCAL_MULTIPLAYER': {
                gui: 'BasicOverlayAddons',
                controllers: {
                    player: 'OnlinePlayer3D',
                    opponent: 'OnlinePlayer3D',
                    spectator: 'AbstractPlayer3D'
                }
            },
            'FREE_PLAY': {
                gui: 'BasicOverlayAddons',
                controllers: {
                    player: 'OnlinePlayer3D',
                    opponent: 'OnlinePlayer3D',
                    spectator: 'AbstractPlayer3D'
                }
            },
        };
        return peripherals[mode];
    }
    createGUI(mode) {
        let peripherals = this.getPeripherals(mode.type);
        const guiType = peripherals.gui;
        return View2D_js_1.default.create(guiType);
    }
    getControllerTypes() {
        let peripherals = this.getPeripherals(this._game.getMode().type);
        const controllerTypes = peripherals.controllers;
        let clientTeam = this.getClientTeam();
        let whiteControlsType, blackControlsType;
        let role = this.getClientRole();
        if (role === 'player') {
            if (clientTeam === ChessTeam_js_1.default.WHITE) {
                whiteControlsType = controllerTypes['player'];
                blackControlsType = controllerTypes['opponent'];
            }
            else if (clientTeam === ChessTeam_js_1.default.BLACK) {
                whiteControlsType = controllerTypes['opponent'];
                blackControlsType = controllerTypes['player'];
            }
        }
        else if (role === 'spectator') {
            whiteControlsType = controllerTypes['spectator'];
            blackControlsType = controllerTypes['spectator'];
        }
        return {
            white: whiteControlsType,
            black: blackControlsType
        };
    }
    _keyInputs() {
        if (this._view3D) {
            this._view3D.keyInputs();
        }
    }
    _update(step) {
        // TODO: playerassignment
        if (this._game) {
            this.unsubscribePlayers();
            let controllerTypes = this.getControllerTypes();
            this._game.setPlayerControls(controllerTypes);
            this.subscribePlayers();
            this._game.update(step);
        }
        if (this._view3D) {
            this._view3D.update();
        }
    }
    _draw() {
        if (this._view3D) {
            this._view3D.draw();
        }
    }
    _startLoop() {
        let last = 0;
        let now = window.performance.now();
        let dt;
        let accumulation = 0;
        const step = 1 / 60; // update simulation every 1/60 of a second (60 fps)
        let frame = () => {
            now = window.performance.now(); // store the time when the new frame starts
            dt = now - last; // calculate the amount of time the last frame took
            accumulation += Math.min(1, dt / 1000); // increase accumulation by the amount of time the last frame took and limit accumulation time to 1 second.
            // KEY INPUTS
            this._keyInputs();
            // if the accumulated time is larger than the fixed time-step, continue to
            // update the simulation until it is caught up to real time
            while (accumulation >= step) {
                // UPDATE
                this._update(step);
                accumulation -= step;
            }
            // DRAW
            this._draw();
            last = now;
            requestAnimationFrame(frame); // repeat the loop
        };
        requestAnimationFrame(frame);
    }
    debugLoad(event) {
        this.loadFrom(Games_json_1.default.basic);
    }
    debugExport(event) {
        console.log(JSON.stringify(this._game));
    }
}
exports.ClientGameManager = ClientGameManager;
class Embed extends react_1.Component {
    componentDidMount() {
        // Mount three.js canvas
        this.props.gameManager.mount(this._root);
        // Trigger onMount callback
        this.props.onMount();
    }
    componentDidUpdate() {
        this.render();
    }
    render() {
        console.log('Rerender: Embed is', this.props.focus);
        let maximized = this.props.focus !== 'minimized';
        this.props.gameManager.setFocus(this.props.focus);
        return (<div id="embedPositioner">
				<div id="embed" className={maximized ? 'embed-maximized' : 'embed-minimized'} ref={(ref) => (this._root = ref)}>
					{maximized ? this.props.gameManager.view2D() : <react_bootstrap_1.Nav.Link className='overlay clickable' href="#/play"></react_bootstrap_1.Nav.Link>}
				</div>
			</div>);
    }
}
exports.Embed = Embed;
// setRoom(room) {
// 	room.onMessage('chatMsg', (message) => {
// 		// this._view2D.addMsg(message);
// 	});
// 	room.onMessage('move', (data) => {
// 		let move = Move.revive(data.move);
// 		// TODO: Can optimize by instead, receiving precomputed
// 		// moveData from server. This would remove the need
// 		// to calculate possibleMovesBefore/After + status
// 		// on the client side.
// 		this.makeMove(move);
// 		this.setPlayerData(data.playerData);
// 	});
// 	// TODO: change to gameAssignment
// 	room.onMessage('chessGame', (jsonData) => {
// 		console.log('received chessGame');
// 		this.loadFrom(jsonData);
// 	});
// 	room.onMessage('playerData', (jsonData) => {
// 		console.log('received playerData', jsonData);
// 		this.setPlayerData(jsonData);
// 	})
// 	if (this._room) {
// 		this._room.leave();
// 	}
// 	this._room = room;
// 	// this._view2D.setRoom(room);
// 	if (this._game) {
// 		this._game.setRoom(room);
// 	}
// }
// setPlayerData(playerData) {
// 	super.setPlayerData(playerData);
// 	let decoded = jwt.decode(this._authToken, {complete: true});
// 	let clientId = decoded.payload._id;
// 	if (clientId === playerData._white._id) {
// 		this._clientTeam = ChessTeam.WHITE;
// 	} else if (clientId === playerData._black._id) {
// 		this._clientTeam = ChessTeam.BLACK;
// 	} else {
// 		this._clientTeam = ChessTeam.SPECTATOR;
// 	}
// 	console.log('If this gets logged repeatedly then this is a huge performance cost.')
// 	this._game.setPlayerControls(this.getClientTeam());
// 	this.subscribePlayers();
// 	// TODO: whose turn is it bruh
// 	// this._view2D.setPlayerData(playerData, this.getClientTeam());
// }
// getClientTeam() {
// 	return this._clientTeam;
// }
//# sourceMappingURL=ClientGameManager.js.map