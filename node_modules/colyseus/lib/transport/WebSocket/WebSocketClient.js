"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
const ws_1 = __importDefault(require("ws"));
const schema_1 = require("@colyseus/schema");
const Protocol_1 = require("../../Protocol");
const Transport_1 = require("../Transport");
const SEND_OPTS = { binary: true };
class WebSocketClient {
    constructor(id, ref) {
        this.id = id;
        this.ref = ref;
        this.state = Transport_1.ClientState.JOINING;
        this._enqueuedMessages = [];
        this.sessionId = id;
    }
    send(messageOrType, messageOrOptions, options) {
        //
        // TODO: implement `options.afterNextPatch`
        //
        this.enqueueRaw((messageOrType instanceof schema_1.Schema)
            ? Protocol_1.getMessageBytes[Protocol_1.Protocol.ROOM_DATA_SCHEMA](messageOrType)
            : Protocol_1.getMessageBytes[Protocol_1.Protocol.ROOM_DATA](messageOrType, messageOrOptions), options);
    }
    enqueueRaw(data, options) {
        if (this.state === Transport_1.ClientState.JOINING) {
            // sending messages during `onJoin`.
            // - the client-side cannot register "onMessage" callbacks at this point.
            // - enqueue the messages to be send after JOIN_ROOM message has been sent
            this._enqueuedMessages.push(data);
            return;
        }
        this.raw(data, options);
    }
    raw(data, options, cb) {
        if (this.ref.readyState !== ws_1.default.OPEN) {
            console.warn('trying to send data to inactive client', this.sessionId);
            return;
        }
        this.ref.send(data, SEND_OPTS, cb);
    }
    error(code, message = '', cb) {
        this.raw(Protocol_1.getMessageBytes[Protocol_1.Protocol.ERROR](code, message), undefined, cb);
    }
    get readyState() {
        return this.ref.readyState;
    }
    leave(code, data) {
        this.ref.close(code, data);
    }
    close(code, data) {
        console.warn('DEPRECATION WARNING: use client.leave() instead of client.close()');
        try {
            throw new Error();
        }
        catch (e) {
            console.log(e.stack);
        }
        this.leave(code, data);
    }
    toJSON() {
        return { sessionId: this.sessionId, readyState: this.readyState };
    }
}
exports.WebSocketClient = WebSocketClient;
//# sourceMappingURL=WebSocketClient.js.map