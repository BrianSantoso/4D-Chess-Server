/**
 * TODO BEFORE PRODUCTION BUILD:
 * --remove all CDNs
 */
//window.onload = function(){
////    console.log('window loaded')
////	if (Detector.webgl) {
//	main();
////	} else {
////		var warning = Detector.getWebGLErrorMessage();
////		document.getElementById('container').appendChild(warning);
////	}
//};
import React from "react";
import ReactDOM from "react-dom";
import io from 'socket.io-client';

import SceneManager from "./SceneManager.js";
import ClientStateManager from "./ClientStateManager.js";
import ClientState from "./ClientState.js";
import Models from "./Models.js";
import * as THREE from "three";
import TrackballControls from "./TrackballControls.js";
import GameBoard from "./GameBoard.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";
import MoveManager from "./MoveManager.js";
import Mode from "./Mode.js";
import Pointer from "./Pointer.js";
import UI, { EmptyUI } from "./UI.js";
import { CameraAnimation } from "./Animation.js";
import { genGameId } from "./Utils.js";

const SERVER = false;
const BOARD_SIZE = 4;
let socket;
let scene;
let camera;
let renderer;
let controls;
let backendBoard;
let backendMoveManager;
let gameBoard;
let moveManager;
let pointer;
let animationQueue = []
let debugSphere;
let stateManager = new ClientStateManager(SERVER ? ClientState.SERVER : ClientState.MENU);
let uiProxy;
let toolbarProxy;
let sceneManager;

/**
 * Load Models then call init()
 */
export function main() {
	const modelLoadProm = Models.loadModels();
	modelLoadProm.then(init, function(reason) {
		console.error("Could not load models.", reason);
	});
}

/**
 * Initialize all
 */
function init(){
	initSocketIO();
	initTHREE();
	initReact();
	initGameBoard();
	initPointer();
	// begin the game loop
	console.log(scene)
	stateManager.gameLoop();
}

/**
 * Initialize socket.io event handlers
 */
function initSocketIO() {
	try {
		socket = io();
		socket.on('serve move', (move) => {
			console.log('received move', move)
			moveManager.move(move.x0, move.y0, move.z0, move.w0,
							move.x1, move.y1, move.z1, move.w1, true, move.metaData)
		});
		socket.on('player assignment', (playerAssignment) => {
			console.log('player assignment: ', playerAssignment)
			history.pushState({}, null, playerAssignment.gameID);
			moveManager.loadFromPlayerAssignment(playerAssignment);
		})

		socket.on('player joined', (playerAssignment) => {

			if (!moveManager.ready) {
				moveManager.ready = playerAssignment.ready;
			}
			moveManager.updateUI();
			moveManager.updateSelectability();
		})

		const gameID = window.location.pathname.substring(1);
		if (gameID.match(/g[A-Za-z0-9]{7}/)) {
			socket.emit('join', gameID);
			console.log('attempting to join: ', gameID)
		}

	} catch(e) {
		console.error('socket.io failed to initialize')
		socket = {
			emit: function(){}
		}
	}

}

/**
 * Initialize UI variables and render the ReactDOM
 */
function initReact() {
	uiProxy = new EmptyUI(); // will be changed when component mounts
	toolbarProxy = new EmptyUI();
	ReactDOM.render(
	  <App />,
	  document.getElementById('gui')
	);
}

/**
 * Initialize GameBoard and MoveManager
 */
function initGameBoard() {

	gameBoard = new GameBoard(4, BoardGraphics, scene, animationQueue);
	moveManager = new MoveManager(gameBoard, 0, Mode.ONLINE_MULTIPLAYER, uiProxy, toolbarProxy, pointer);

	if (SERVER) {
		return;
	}

	camera.position.set(600, 510, gameBoard.graphics.getCenter().z)
	const target = gameBoard.graphics.getCenter();
	controls.target.set(target.x, target.y, target.z);

	let coolPos = {x: 555.8170713338144, y: 506.7444028015284 + 110, z: -420}
	let coolTar = {x: 0, y: 262.5 + 110, z: -420}
	camera.position.set(coolPos.x, coolPos.y, coolPos.z);
	controls.target.set(coolTar.x, coolTar.y, coolTar.z);
}

function initTHREE() {
	sceneManager = new SceneManager();
}

function initPointer(){
	if (SERVER) {
		return;
	}
    pointer = new Pointer(scene, camera, renderer, gameBoard, moveManager)
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {clientState: stateManager.state};
    this.swapState = this.swapState.bind(this)
    this.exitMenu = this.exitMenu.bind(this)
    this.backToMenu = this.backToMenu.bind(this)

    this.playButtonClick = this.playButtonClick.bind(this)
    this.matchmake = this.matchmake.bind(this)
    this.createSandboxGame = this.createSandboxGame.bind(this)
    this.createLocalGame = this.createLocalGame.bind(this)
  }

  swapState(clientState) {
    console.log("App.swapState called")
    this.setState({
        clientState: clientState
    })
    stateManager.swapState(clientState);
  }

  exitMenu() {
    let whichSide = -2 * moveManager.clientTeam + 1;
    if (moveManager.clientTeam === -1) {
        whichSide = 1;
    }
    const cameraDestination = new THREE.Vector3(600 * whichSide, 510, gameBoard.graphics.getCenter().z);
    const smoothness = 3/300;
    const squaredEpsilon = 100;
    const interpolatedCoords = CameraAnimation.smoothLerp(camera.position, cameraDestination, smoothness, squaredEpsilon);
    CameraAnimation.addToQueue(animationQueue, camera, interpolatedCoords)
    this.swapState(ClientState.GAME_STATE);
  }

  matchmake() {
    socket.emit('matchmake');
    // TODO: Show matchmaking screen
    uiProxy.exitMenu();
  }

  createPrivateGame() {
    const gameID = genGameId()
    socket.emit('join', gameID);
    history.pushState({}, null, gameID);
  }

  createSandboxGame() {
    history.pushState({}, null, 'sandbox');
    moveManager.setMode(Mode.SANDBOX);
    moveManager.updateUI();
    moveManager.updateSelectability();
    this.exitMenu();
  }

  createLocalGame() {
    history.pushState({}, null, 'localGame');
    moveManager.setMode(Mode.LOCAL_MULTIPLAYER);
    moveManager.updateUI();
    moveManager.updateSelectability();
    this.exitMenu();
  }

  componentDidMount() {
    uiProxy = new UI(this);
  }

  render() {
    if (this.state.clientState === ClientState.MENU) {
        return this.menu();
    } else if(this.state.clientState === ClientState.PLAY_OPTIONS) {
        return this.playOptions();
    } else {
        return this.game();
    }
  }

  menu() {
    console.log('MENU')
    return (
      <div className="overlay">
        <h1 className="text" id="gameTitle">4D Chess </h1>
        <h1 className="text" id="gameSubTitle"> Online </h1>
        <PlayButton id="playButton" text="Play" handleClick={this.playButtonClick}/>
        <PlayButton id="privateRoomButton" text="Create Private Game" handleClick={this.createPrivateGame}/>
      </div>
    );
  }

  playButtonClick() {
    this.swapState(ClientState.PLAY_OPTIONS);
  }

  backToMenu() {
    this.swapState(ClientState.MENU);
  }

  playOptions() {
    return (
      <div className="overlay">
        <div id="playOptionsMenu">
          <h1 className="text"> Pick a Game Mode</h1>
          <PlayOption id="matchmakingButton" text="Online Matchmaking" handleClick={this.matchmake}></PlayOption>
          <PlayOption id="localMultiplayerButton" text="Local Multiplayer" handleClick={this.createLocalGame}></PlayOption>
          <PlayOption id="sandboxButton" text="Free Play" handleClick={this.createSandboxGame}></PlayOption>
          <PlayOption id="backToMenuButton" text="Back To Menu" handleClick={this.backToMenu}></PlayOption>
        </div>
      </div>
    );
  }

  game() {
    return (
      <div className="overlay">
        <div id="toolbar">
          <UndoButton on id="undoButton"/>
          <MoveStatus id="moveStatus"></MoveStatus>
          <RedoButton id="redoButton"/>
        </div>
      </div>
    );
  }
}

class MoveStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ""
    }
    moveManager.updateUI();
  }

  componentDidMount() {
    toolbarProxy = new UI(this);
	moveManager.toolbarProxy = toolbarProxy;
    moveManager.updateUI();
  }

  render() {
    return (
      <div id={this.props.id} className="text toolbarItem">
        {this.state.text}
      </div>
    );
  }

}

class RectMenuButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.props.handleClick;
  }

  render() {
    return (
      <button onClick={this.handleClick} className="text rectButton" id={this.props.id}>
        {this.props.text}
      </button>
    );
  }
}

class PlayButton extends RectMenuButton {

}

class PlayOption extends RectMenuButton {
 render() {
   return (
     <button onClick={this.handleClick} className="text rectButton playOptionButton" id={this.props.id}>
       {this.props.text}
     </button>
   );
 }
}

class MoveHistoryButton extends React.Component {
render() {
  return (
    <a onClick={this.handleClick} className="moveHistoryButton toolbarItem" id={this.props.id}>
      <img src={this.imgSrc}/>
    </a>
  );
}
}

class RedoButton extends MoveHistoryButton {
  constructor(props) {
    super(props);
    this.imgSrc = "./icons/arrow_forward_ios-24px.svg";
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
      moveManager.redo();
  }
}

class UndoButton extends MoveHistoryButton {
 constructor(props) {
   super(props);
   this.imgSrc = "./icons/arrow_back_ios-24px.svg";					
   this.handleClick = this.handleClick.bind(this);
 }
 handleClick() {
   moveManager.undo();
 }
}