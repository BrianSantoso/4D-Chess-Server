import { ClientGameManager } from "./ClientGameManager.js";
import { Player3D } from "./ChessPlayer.js";
import BoardGraphics3D from "./BoardGraphics3D.js";
import * as Colyseus from "colyseus.js";
import config from "./config.json";

class App {
	constructor() {
		this._client = new Colyseus.Client("ws://localhost:3000");
		this._gameManager = new ClientGameManager(this._client);
		// TODO: should be gameManager.loadAssets().then()
		this._gameManager.loadAssets().then(() => {
			// TODO: these options should be overriden when an actual game assignment is given
			// let options = {
			// 	dim: config.dims.standard,
			// 	WhitePlayer: Player3D,
			// 	BlackPlayer: Player3D,
			// 	BoardGraphics: BoardGraphics3D
			// };
			// let game = this._gameManager.createAndSetGame(options);

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
}

App.main = function() {
	let app = new App();
}

export default App;