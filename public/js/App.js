import { ClientGameManager } from "./GameManager.js";
import { LocalChessGame } from "./ChessGame.js";
import Models from "./Models.js";

class App {
	constructor() {
		this._gameManager = new ClientGameManager();
		Models.loadModels().then(() => {
			let game = new LocalChessGame(4);
			this._gameManager.setGame(game);
			this._gameManager._startLoop();
		});
	}
}

App.main = function() {
	let app = new App();
}

export default App;