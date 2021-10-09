"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const gameSchema = new mongoose_1.Schema({
    gameType: {
        type: String,
        required: true
    },
    players: {
        type: [{
                userId: {
                    type: Scheme.Types.ObjectId,
                    required: true
                },
                usernameAtTheTime: {
                    type: String,
                    required: true
                },
                eloAtTheTime: {
                    type: Number,
                    required: true
                }
            }],
        required: true
    },
    gameJSON: {
        type: String,
        required: true
    }
});
const Game = mongoose_1.Model('Game', gameSchema);
exports.default = Game;
//# sourceMappingURL=Game.model.js.map