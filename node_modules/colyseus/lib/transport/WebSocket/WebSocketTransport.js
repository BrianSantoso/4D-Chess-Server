"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketTransport = void 0;
const querystring_1 = __importDefault(require("querystring"));
const url_1 = __importDefault(require("url"));
const ws_1 = __importDefault(require("ws"));
const matchMaker = __importStar(require("../../MatchMaker"));
const Protocol_1 = require("../../Protocol");
const Transport_1 = require("../Transport");
const Debug_1 = require("../../Debug");
const WebSocketClient_1 = require("./WebSocketClient");
function noop() { }
function heartbeat() { this.pingCount = 0; }
class WebSocketTransport extends Transport_1.Transport {
    constructor(options = {}, engine) {
        super();
        // disable per-message deflate
        options.perMessageDeflate = false;
        if (options.pingTimeout !== undefined) {
            console.warn('"pingTimeout" is deprecated. Use "pingInterval" instead.');
            options.pingInterval = options.pingTimeout;
        }
        if (options.pingCountMax !== undefined) {
            console.warn('"pingCountMax" is deprecated. Use "pingMaxRetries" instead.');
            options.pingMaxRetries = options.pingCountMax;
        }
        this.pingIntervalMS = (options.pingInterval !== undefined)
            ? options.pingInterval
            : 3000;
        this.pingMaxRetries = (options.pingMaxRetries !== undefined)
            ? options.pingMaxRetries
            : 2;
        this.wss = new engine(options);
        this.wss.on('connection', this.onConnection);
        this.server = options.server;
        if (this.pingIntervalMS > 0 && this.pingMaxRetries > 0) {
            this.autoTerminateUnresponsiveClients(this.pingIntervalMS, this.pingMaxRetries);
        }
    }
    listen(port, hostname, backlog, listeningListener) {
        this.server.listen(port, hostname, backlog, listeningListener);
        return this;
    }
    shutdown() {
        clearInterval(this.pingInterval);
        this.wss.close();
        this.server.close();
    }
    simulateLatency(milliseconds) {
        const previousSend = ws_1.default.prototype.send;
        ws_1.default.prototype.send = function (...args) {
            setTimeout(() => previousSend.apply(this, args), milliseconds);
        };
    }
    autoTerminateUnresponsiveClients(pingInterval, pingMaxRetries) {
        // interval to detect broken connections
        this.pingInterval = setInterval(() => {
            this.wss.clients.forEach((client) => {
                //
                // if client hasn't responded after the interval, terminate its connection.
                //
                if (client.pingCount >= pingMaxRetries) {
                    // debugConnection(`terminating unresponsive client ${client.sessionId}`);
                    Debug_1.debugConnection(`terminating unresponsive client`);
                    return client.terminate();
                }
                client.pingCount++;
                client.ping(noop);
            });
        }, pingInterval);
    }
    onConnection(rawClient, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // prevent server crashes if a single client had unexpected error
            rawClient.on('error', (err) => Debug_1.debugAndPrintError(err.message + '\n' + err.stack));
            rawClient.on('pong', heartbeat);
            // compatibility with ws / uws
            const upgradeReq = req || rawClient.upgradeReq;
            const parsedURL = url_1.default.parse(upgradeReq.url);
            const sessionId = querystring_1.default.parse(parsedURL.query).sessionId;
            const processAndRoomId = parsedURL.pathname.match(/\/[a-zA-Z0-9_\-]+\/([a-zA-Z0-9_\-]+)$/);
            const roomId = processAndRoomId && processAndRoomId[1];
            const room = matchMaker.getRoomById(roomId);
            // set client id
            rawClient.pingCount = 0;
            const client = new WebSocketClient_1.WebSocketClient(sessionId, rawClient);
            try {
                if (!room || !room.hasReservedSeat(sessionId)) {
                    throw new Error('seat reservation expired.');
                }
                yield room._onJoin(client, upgradeReq);
            }
            catch (e) {
                Debug_1.debugAndPrintError(e);
                // send error code to client then terminate
                client.error(e.code, e.message, () => rawClient.close(Protocol_1.Protocol.WS_CLOSE_WITH_ERROR));
            }
        });
    }
}
exports.WebSocketTransport = WebSocketTransport;
//# sourceMappingURL=WebSocketTransport.js.map