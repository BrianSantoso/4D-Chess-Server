import colyseus, { Room } from 'colyseus';
import config from '../../public/js/config.json';
import Move from "../../public/js/Move.js";
import ServerGameManager from './ServerGameManager';
import jwt from 'jsonwebtoken';
import User from './models/User.model.js';
import { config as dotconfig } from 'dotenv';
dotconfig();

class ChessRoom extends Room {
    
    // Wrapper for chatMsg broadcast
    chatMsg(client, message, options) {
        // client is null if called from server

        // TODO: rate limit messages and filter for spam/abuse
        // TODO: authenticate user (make sure they are said user) before sending message?
        if (client) {
            let decoded = jwt.verify(options.authToken, process.env.JWT_SECRET);
            message.sender = decoded.username;
        }
        this.broadcast("chatMsg", message, options);
    }

    // When room is initialized
    onCreate (options) {
        this.playersTokens = []; // tokens instead of db user objects as shortcut
        this.sessionIdToUsername = new Map(); // used soleley for onLeave message.

        this.chatMsg = this.chatMsg.bind(this);

        this.onMessage('chatMsg', this.chatMsg);

        this.onMessage('move', (client, message) => {
            console.log('Move received:', message)
            let move = Move.revive(message);
            // TODO: move validation
            this._gameManager.makeMove(move);

            // TODO: move broadcast inside of Player?
            this.broadcast('move', move, { except: client });
        })

        console.log('Created instance of ChessRoom:', options)

        this._gameManager = new ServerGameManager();
        this._gameManager.createAndSetGame(options);
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client, options, request) {
        // validate json web token
        // if valid, retrieve player id and add to players
        // otherwise, add ??? guest to plyers (how to identify a guest?)
        let authToken = options.authToken;
        if (authToken) {
            let decoded = jwt.verify(options.authToken, process.env.JWT_SECRET);
            if (decoded) {
                return {
                    decoded: decoded
                }
            } else {
                throw new ServerError(400, "Bad authToken");
            }
        } else {
            throw new ServerError(400, "Bad authToken");
        }
    }

    // When client successfully join the room
    onJoin (client, options, auth) {
        let username = auth.decoded.username;
        this.playersTokens.push(auth.decoded);

        this.chatMsg(null, {
            msg: `${username} has joined the room`,
            style: {
                color: 'rgb(255, 251, 13)'
            }
        }, {});
        client.send('chessGame', this._gameManager.toJSON());
    }

    // When a client leaves the room
    onLeave (client, consented) {
        // let username = 
        // this.chatMsg(null, {
		// 	msg: `${username} has left the room`,
		// 	style: {
		// 		color: 'rgb(255, 251, 13)'
		// 	}
		// });
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {

    }
}

export default ChessRoom;