import React, { Component } from "react";
import Detector from "./Detector.js";
import { main } from "./app.js";

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
if (Detector.webgl) {
    main();
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}