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

import ClientStateManager from "./ClientStateManager.js";
import ClientState from "./ClientState.js";
import Models from "./Models.js";
import * as THREE from "three";
import TrackballControls from "./TrackballControls.js";
import GameBoard, { BoardGraphics, EmptyBoardGraphics } from "./GameBoard.js";
import MoveManager from "./MoveManager.js";
import Mode from "./Mode.js";
import Pointer from "./Pointer.js";
import UI, { EmptyUI } from "./UI.js";

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
	initControls();
	initGameBoard();
	initPointer();
	initReact();
	// begin the game loop
	console.log(scene)
	requestAnimationFrame(frame);
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

	gameBoard = new GameBoard(4, BoardGraphics, scene);
	moveManager = new MoveManager(gameBoard, 0, Mode.ONLINE_MULTIPLAYER, true);

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

/**
 * Initialize three.js scene and camera
 */
function initTHREE(){

	if (SERVER) {
		return;
	}

	// Code from three.js scene creation example.
	// https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
	scene = new THREE.Scene(); // Create new scene
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 9000); 
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.id = "myCanvas"
	document.body.appendChild(renderer.domElement);

	renderer.setClearColor(0xf7f7f7);
	// Code from three.js ambient light example:
	// https://threejs.org/docs/index.html#api/lights/AmbientLight
	let ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
	scene.add(ambientLight);

	let lightPosition1 = new THREE.Vector3(70, 300, -50);
	let lightPosition2 = new THREE.Vector3(-70, 300, -50);
	let directionalLightIntensity = 0.4;
	let directionalLightColour = 0xFFFFFF;
	let shadowFrustum = 50;
	let shadowMapWidth = 1024;
	let shadowMapHeight = 1024;
	let directionalLight1 = new THREE.DirectionalLight(directionalLightColour, directionalLightIntensity);
	let directionalLight2 = new THREE.DirectionalLight(directionalLightColour, directionalLightIntensity);
	directionalLight1.position.set(lightPosition1);

	directionalLight1.position.copy(lightPosition1);
	directionalLight1.castShadow = true;
	directionalLight1.shadow.camera.right = shadowFrustum;
	directionalLight1.shadow.camera.left = -shadowFrustum;
	directionalLight1.shadow.camera.top = shadowFrustum;
	directionalLight1.shadow.camera.bottom = -shadowFrustum;
	directionalLight1.shadow.mapSize.width = shadowMapWidth;
	directionalLight1.shadow.mapSize.height = shadowMapHeight;
	scene.add(directionalLight1);

	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		controls.handleResize();
	}
}

/*
 * Initialize TrackballControls
 */
function initControls(){

	if (SERVER) {
		return;
	}
	controls = new TrackballControls( camera, renderer.domElement );

	controls.rotateSpeed = 1.8; // set rotation/zoom/pan speeds
	controls.zoomSpeed = 1.5;
	controls.panSpeed = 0.45;

	controls.noZoom = false; // enable zooming, panning, and smooth panning
	controls.noPan = false;
	controls.staticMoving = false;

	controls.dynamicDampingFactor = 0.2; // set dampening factor
	controls.minDistance = 100
	controls.maxDistance = 1400
}

function initPointer(){
	if (SERVER) {
		return;
	}
    pointer = new Pointer(scene, camera, renderer, gameBoard, moveManager)
}

/**
 * Define the game loop
 */
let last = 0;
let now = window.performance.now();
let dt;
let accumulation = 0;
const step = 1/60; // update simulation every 1/60 of a second (60 fps)

/*
 * Game Loop
 */
function frame() {

	now = window.performance.now(); // store the time when the new frame starts
	dt = now - last; // calculate the amount of time the last frame took
	accumulation += Math.min(1, dt/1000);	// increase accumulation by the amount of time the last frame took and limit accumulation time to 1 second.

	stateManager.keyInputs(step, controls, pointer, camera); // update mouse input

	// if the accumulated time is larger than the fixed time-step, continue to
	// update the simulation until it is caught up to real time
	while(accumulation >= step){
		stateManager.update(); // update the simulation
		accumulation -= step;
	}
	// render the scene
	stateManager.render(scene, camera, renderer, animationQueue);

	last = now;
	requestAnimationFrame(frame); // repeat the loop
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