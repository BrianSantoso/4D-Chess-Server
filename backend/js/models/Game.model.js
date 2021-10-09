import Mongoose, { Schema, Model } from 'mongoose';

const gameSchema = new Schema({
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
        type: String, // Stringified json object
        required: true
    }
});

const Game = Model('Game', gameSchema);

export default Game;