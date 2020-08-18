import Picece from "./Piece.js";
import BoardGraphics, { EmptyBoardGraphics } from "./BoardGraphics.js";

class ChessGame {	
	constructor() {
		this._moveManager;
		this._controllers = [];
		this._board = new GameBoard();
		this._boardGraphics = new BoardGraphics(); // 3D View
		this._layerStack; // 2D View
	}
}

ChessGame.NONE = -1;
ChessGame.WHITE = 0;
ChessGame.BLACK = 1;
ChessGame.TIE_GAME = 2;

export default ChessGame;