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
        // TODO: rate limit messages and filter for spam/abuse
        if (client) {
            message.sender = client.sessionId;
        }
        this.broadcast("chatMsg", message, options);
    }

    // When room is initialized
    onCreate (options) {
        this.sessionIdToUser = new Map();
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
        let token = options.authToken;
        let playerFindProm;
        try {
            let decoded = jwt.verify(token, process.env.JWT_SECRET);
            let _id = decoded.payload._id;
            playerFindProm = User.findById(_id);
        } catch {
            // Player is guest/sent invalid token
            playerFindProm = Promise.reject();
        }
        return {
            playerFindProm: playerFindProm
        };
    }

    // When client successfully join the room
    onJoin (client, options, auth) {
        auth.playerFindProm
            .then(user => {
                this.sessionIdToUser.set(client.sessionId, user);
            })
            .catch(err => {
                // Player is guest/sent invalid token
            })
            .finally(() => {
                let username = this.getUsername(client.sessionId);
                this.chatMsg(null, {
                    msg: `${username} has joined the room`,
                    style: {
                        color: 'rgb(255, 251, 13)'
                    }
                }, {});
            });
        client.send('chessGame', this._gameManager.toJSON());
    }

    // When a client leaves the room
    onLeave (client, consented) {
        this.chatMsg(null, {
			msg: `${client.sessionId} has left the room`,
			style: {
				color: 'rgb(255, 251, 13)'
			}
		});
    }

    getUsername(sessionId) {
        // let user = this.sessionIdToUserId.get(sessionId);
        // if (user) {
        //     user.get('username');  
        // } else {
        //     return 'Guest-'+sessionId;
        // } 
        return this.getUserProperty(sessionId, 'username', (sessionId) => `Guest-${sessionId}`);
    }

    getUserProperty(sessionId, property, ifGuestResulter) {
        let user = this.sessionIdToUser.get(sessionId);
        if (user) {
            return user.get(property);  
        } else {
            return ifGuestResulter(sessionId);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
    }
}

export default ChessRoom;