import GameBoard from "./GameBoard.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";

class ChessGame {	
	constructor(n) {
		this._board = new GameBoard(n);
		this._boardGraphics = new BoardGraphics(n); // 3D View
		this._layerStack; // 2D View
		
		this._moveManager;
		this._controllers = [];
	}
	
	view3D() {
		return this._boardGraphics.view3D();
	}
	
	keyInputs() {
		
	}
	
	update() {
		this._boardGraphics.update();
	}
}

ChessGame.NONE = -1;
ChessGame.WHITE = 0;
ChessGame.BLACK = 1;
ChessGame.TIE_GAME = 2;

export default ChessGame;