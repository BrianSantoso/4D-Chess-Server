import { ClientGameManager } from "./GameManager.js";
import { ChessGame } from "./ChessGame.js";
import { Player3D } from "./ChessPlayer.js";
import BoardGraphics from "./BoardGraphics.js";
import Models from "./Models.js";

class App {
	constructor() {
		this._gameManager = new ClientGameManager();
		// TODO: should be gameManager.loadAssets().then()
		Models.loadModels().then(() => {
			let config = {
				n: 4,
				WhitePlayer: Player3D,
				BlackPlayer: Player3D,
				BoardGraphics: BoardGraphics
			};
			let game = this._gameManager.createGame(config);
			this._gameManager.setGame(game);
			this._gameManager._startLoop();
		});
	}
}

App.main = function() {
	let app = new App();
}

export default App;