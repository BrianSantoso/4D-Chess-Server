import colyseus, { Server } from 'colyseus';
import express from 'express';
import http from 'http';
import Mongoose from 'mongoose';
import dotenv from 'dotenv';

import ChessRoom from './js/ChessRoom.js'
import config from './public/js/config.json';
import { ChessMode } from './public/js/ChessGame.js';
import { DummyPlayer } from './public/js/ChessPlayer.js';
import BoardGraphics from './public/js/BoardGraphics.js';

dotenv.config();

class ServerInstance {
    constructor() {
        this.PORT = process.env.PORT || 3000;
        this.app = express();
        // this.app.use(express.json());
        this.app.use(express.static('public'));
        
        this.gameServer = new Server({
            server: http.createServer(this.app)
        });

        this.defineRooms();

        this.gameServer.listen(this.PORT, () => {
            console.log(`Listening on port ${this.PORT}`);
        });
    }

    connectToDb() {
        const uri = process.env.DB_URI;
        Mongoose.connect(uri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true // is this needed?
        })
        .then(() => console.log('MongoDB database connection established successfully'))
        .catch(err => console.error('MongoDB connection error: ', err))
        this.db = Mongoose.connection;
    }

    defineRooms() {
        let standardOptions = {
            mode: ChessMode.ONLINE_MULTIPLAYER,
            dim: config.dims.standard,
            BoardGraphics: BoardGraphics, // empty BoardGraphics
            WhitePlayer: DummyPlayer,
            BlackPlayer: DummyPlayer
        }
        this.gameServer.define('standard', ChessRoom, standardOptions);
    }
}

new ServerInstance();