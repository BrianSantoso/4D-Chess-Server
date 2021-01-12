import colyseus, { Room } from 'colyseus';
import config from '../../public/js/config.json';
import Move from "../../public/js/Move.js";
import ServerGameManager from './ServerGameManager';

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
        return true;
    }

    // When client successfully join the room
    onJoin (client, options, auth) {
        this.chatMsg(null, {
			msg: `${client.sessionId} has joined the room`,
			style: {
				color: 'rgb(255, 251, 13)'
			}
        }, options);
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

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
    }
}

export default ChessRoom;