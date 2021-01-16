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
            message.sender = this.getUsername(client.sessionId);
        }
        this.broadcast("chatMsg", message, options);
    }

    getPlayerData() {
        // let allUsers = this.allUsers();
        // let white = this.users.get(this.whiteId);
        // let black = this.users.get(this.blackId);
        // return {
        //     // another way to find all connected users is to user this.clients + sessionIdToUser
        //     connectedUsers: allUsers, 
        //     white: Object.assign(white, {
        //         time: 600000
        //     }),
        //     black: Object.assign(black, {
        //         time: 600000
        //     }),
        // };
        let playerData = this._gameManager.getPlayerData();
        return playerData;
        // Object.assign(, {
        //     connectedUsers: this.allUsers()
        // });
    }

    broadcastPlayerData(options) {
        let playerData = this.getPlayerData();
        this.broadcast("playerData", playerData, options);
        return playerData;
    }

    strip(user) {
        return {
            _id: user._id,
            _username: user.username,
            _elo: user.elo
        }
    }

    connectedUsers() {
        return Array.from(this.users.values());
    }

    addUser(sessionId, user) {
        let _id = user.get('_id');
        let stripped = this.strip(user);
        this.sessionIdToUser.set(sessionId, stripped);
        if (!this.users.has(_id)) {
            // If user has not joined the room yet
            if (!this.whiteId) {
                this.whiteId = _id;
            } else if (!this.blackId) {
                this.blackId = _id;
            }

            this.users.set(_id, stripped);

            // TODO: this will add a weird _time field to the user in this.users map
            // but is necessary in order to properly attach _time to an empty player.
            // To fix, reverse the order of Object.assign, and create a deep copy of
            // this.users.get(----)
            this._gameManager.setPlayerData({
                _white: Object.assign(this.users.get(this.whiteId) || this._gameManager.getPlayerData()._white, {
                    _time: this.timeControl
                }),
                _black: Object.assign(this.users.get(this.blackId) || this._gameManager.getPlayerData()._black, {
                    _time: this.timeControl
                })
            });
        }

        this.broadcastPlayerData();
    }

    removeUser(user) {
        // find user by id
        this.users.delete(user._id);

        let playerData = this.broadcastPlayerData();
        this._gameManager.setPlayerData(playerData);
    }
    // When room is initialized
    onCreate (options) {
        this.whiteId = null;
        this.blackId = null;
        this.timeControl = options.timeControl;
        this.users = new Map();
        this.sessionIdToUser = new Map(); // TODO: susceptible to memory attack if user closes and reopens repeatedly
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
        let authToken = options.authToken;
        if (authToken) {
            let decoded = jwt.verify(options.authToken, process.env.JWT_SECRET);
            if (decoded) {
                let playerAuthProm = User.findById(decoded._id)
                .catch(err => {
                    // TODO: User with that id does not exist
                    throw new ServerError(400, "Bad authToken: User with that id does not exist");
                });
                return {
                    playerAuthProm: playerAuthProm
                };
            } else {
                throw new ServerError(400, "Bad authToken");
            }
        } else {
            throw new ServerError(400, "Bad authToken");
        }
    }

    // When client successfully join the room
    onJoin (client, options, auth) {
        auth.playerAuthProm
            .then(user => {
                this.addUser(client.sessionId, user);
                console.log('User joined room:', user)
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
        let user = this.getUser(client.sessionId);
        this.removeUser(user);

        let username = this.getUsername(client.sessionId);
        this.chatMsg(null, {
			msg: `${username} has left the room`,
			style: {
				color: 'rgb(255, 251, 13)'
			}
		});
    }

    getUser(sessionId) {
        return this.sessionIdToUser.get(sessionId);
    }

    getUsername(sessionId) {
        return this.getUserProperty(sessionId, '_username');
    }

    getUserProperty(sessionId, property) {
        let user = this.getUser(sessionId);
        return user[property];
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {

    }
}

export default ChessRoom;