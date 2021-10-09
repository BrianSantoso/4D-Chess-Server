"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const GameManager_js_1 = tslib_1.__importDefault(require("../../public/js/GameManager.js"));
const Move_js_1 = tslib_1.__importDefault(require("../../public/js/Move.js"));
class ServerGameManager extends GameManager_js_1.default {
    // Handle's server-specific peripherals needed to
    // create the server's copy of the game
    createGame(options) {
        let game = super.createGame(options);
        let room = this._room;
        game.setRoom(room, function configureMessageHandlers() {
            // Configure server-side room message handlers
            // 'this' is bound to the game
            room.onMessage('chatMsg', room._chatMsg);
            room.onMessage('submitMove', (client, move) => {
                move = Move_js_1.default.revive(move); // TODO: WARNING: client can crash server if sending a moveData with wrong fields: '... is undefined'
                // let moveData = this.makeMove(move);
                // TODO: move broadcast inside of Player?
                try {
                    let authorizedMoveData = this.makeMove(move);
                    // TODO: move broadcast inside of Player?
                    room.broadcast('makeMove', authorizedMoveData, { except: client });
                    client.send('syncMoveData', authorizedMoveData);
                    // TODO: resynchronize client
                }
                catch (_a) {
                    // TODO: don't just catch any error. catch illegal move error. 
                    // (don't want to accuse someone of cheating if the error is internal)
                    console.log('Invalid move.');
                }
            });
        });
        game.setNeedsValidation(true);
        return game;
    }
}
exports.default = ServerGameManager;
//# sourceMappingURL=ServerGameManager.js.map