"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ChessGame_js_1 = tslib_1.__importStar(require("./ChessGame.js"));
class GameManager {
    constructor() {
        this._game;
        this._room;
    }
    setRoom(room) {
        this._room = room;
    }
    createAndSetGame(options) {
        let chessGame = this.createGame(options);
        this.setGame(chessGame);
        return chessGame;
    }
    loadFrom(jsonData) {
        console.log("Loading from:", jsonData);
        let template = this.createGame({
            boardConfig: null
        });
        let delta = ChessGame_js_1.default.revive(jsonData);
        // let newGame = Object.assign(template, ChessGame.revive(jsonData));
        let newGame = ChessGame_js_1.deepMerge(template, delta); // need deep merge so that templated Players receive their fields.
        console.log('Template:', template);
        console.log('Delta:', delta);
        this.setGame(newGame);
        console.log('Finished loading game:', newGame);
    }
    toJSON() {
        return JSON.parse(JSON.stringify(this._game));
    }
    setGame(game) {
        if (this._game) {
            this._game.setManager(null);
        }
        this._game = game;
        this._game.setManager(this);
    }
    createGame(options) {
        return ChessGame_js_1.default.create(options);
        // TODO: set controllers and subscriptions, etc.
    }
    makeMove(move) {
        this._game.makeMove(move);
    }
    undo() {
        this._game.undo();
    }
    redo() {
        this._game.redo();
    }
}
exports.default = GameManager;
//# sourceMappingURL=GameManager.js.map