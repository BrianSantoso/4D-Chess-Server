import colyseus, { Server } from 'colyseus';
import express from 'express';
import http from 'http';

import ChessRoom from './js/ChessRoom.js'
import config from './public/js/config.json';
import { MoveReceiverTransmitter } from './public/js/ChessPlayer.js';
import BoardGraphics from './public/js/BoardGraphics.js';

class ServerInstance {
    constructor() {
        this.PORT = process.env.port || 3000;
        this.app = express();
        // app.use(express.json());
        this.app.use(express.static('public'));

        this.gameServer = new Server({
            server: http.createServer(this.app)
        });

        this.defineRooms();

        this.gameServer.listen(this.PORT);
    }

    defineRooms() {
        let standardOptions = {
            dim: config.dims.standard,
            BoardGraphics: BoardGraphics, // empty BoardGraphics
            WhitePlayer: MoveReceiverTransmitter,
            BlackPlayer: MoveReceiverTransmitter
        }
        this.gameServer.define('standard', ChessRoom, standardOptions);
    }
}

new ServerInstance();