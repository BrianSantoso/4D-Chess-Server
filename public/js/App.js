import GameManager from "./GameManager.js";

class App {
	constructor() {
		this._gameManager = new GameManager();
		this._gameManager._startLoop();
	}
}

App.main = function() {
	let app = new App();
}

export default App;