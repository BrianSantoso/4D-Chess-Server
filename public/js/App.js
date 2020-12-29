import { ClientGameManager } from "./ClientGameManager.js";
import * as Colyseus from "colyseus.js";

class App {
	constructor() {
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
}

App.main = function() {
	let app = new App();
}

export default App;