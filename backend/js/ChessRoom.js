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
        let playerData = this._gameManager.getPlayerData();
        // return playerData;
        return Object.assign(playerData, {
            _connectedUsers: this.connectedUsers()
        });
    }

    broadcastPlayerData(options) {
        let playerData = this.getPlayerData();
        console.log('playerData', playerData)
        this.broadcast("playerData", playerData, options);
        return playerData;
    }

    strip(user) {
        return {
            _id: user.get('_id'),
            _username: user.username,
            _elo: user.elo
        }
    }

    connectedUsers() {
        return Array.from(this.users.values());
    }

    addUser(client, user) {
        let stripped = this.strip(user);
        let _id = stripped._id;
        this.sessionIdToUser.set(client.sessionId, stripped);
        this.users.set(_id, stripped);
        if (!this.whiteId || !this.blackId) {
            // If user has not joined the room yet
            if (!this.whiteId) {
                this.whiteId = _id;
            } else if (!this.blackId) {
                this.blackId = _id;
            }

            // this.users.set(_id, stripped);
            // TODO: this will mutate and add a weird _time field to the user in this.users map
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

    removeUser(sessionId, user) {
        this.sessionIdToUser.delete(sessionId);
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
        this.sessionIdToUser = new Map();
        this.chatMsg = this.chatMsg.bind(this);

        this.onMessage('chatMsg', this.chatMsg);

        this.onMessage('move', (client, message) => {
            
            let move = Move.revive(message);
            // TODO: move validation
            try {
                let moveData = this._gameManager.makeMove(move);
                // TODO: move broadcast inside of Player?
                this.broadcast('move', {
                    move: move,
                    playerData: this.getPlayerData()
                }, { except: client });
            } catch {
                console.log('Invalid move.')
            }

            console.log('Move received:', this._gameManager._game._moveHistory._moves)
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
                return {
                    playerAuthProm: User.findById(decoded._id)
                    .catch(err => {
                        // TODO: User with that id does not exist
                        throw new ServerError(400, "Bad authToken: User with that id does not exist");
                    })
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
                this.addUser(client, user);
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
        let username = this.getUsername(client.sessionId);
        this.removeUser(client.sessionId, user);

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