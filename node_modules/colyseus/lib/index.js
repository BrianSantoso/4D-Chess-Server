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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delayed = exports.Clock = exports.matchMaker = void 0;
const timer_1 = __importStar(require("@gamestdio/timer"));
exports.Clock = timer_1.default;
Object.defineProperty(exports, "Delayed", { enumerable: true, get: function () { return timer_1.Delayed; } });
// Core classes
var Server_1 = require("./Server");
Object.defineProperty(exports, "Server", { enumerable: true, get: function () { return Server_1.Server; } });
var Room_1 = require("./Room");
Object.defineProperty(exports, "Room", { enumerable: true, get: function () { return Room_1.Room; } });
Object.defineProperty(exports, "RoomInternalState", { enumerable: true, get: function () { return Room_1.RoomInternalState; } });
var Protocol_1 = require("./Protocol");
Object.defineProperty(exports, "Protocol", { enumerable: true, get: function () { return Protocol_1.Protocol; } });
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return Protocol_1.ErrorCode; } });
var RegisteredHandler_1 = require("./matchmaker/RegisteredHandler");
Object.defineProperty(exports, "RegisteredHandler", { enumerable: true, get: function () { return RegisteredHandler_1.RegisteredHandler; } });
var ServerError_1 = require("./errors/ServerError");
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return ServerError_1.ServerError; } });
// MatchMaker
const matchMaker = __importStar(require("./MatchMaker"));
exports.matchMaker = matchMaker;
var Lobby_1 = require("./matchmaker/Lobby");
Object.defineProperty(exports, "updateLobby", { enumerable: true, get: function () { return Lobby_1.updateLobby; } });
Object.defineProperty(exports, "subscribeLobby", { enumerable: true, get: function () { return Lobby_1.subscribeLobby; } });
var LocalPresence_1 = require("./presence/LocalPresence");
Object.defineProperty(exports, "LocalPresence", { enumerable: true, get: function () { return LocalPresence_1.LocalPresence; } });
var RedisPresence_1 = require("./presence/RedisPresence");
Object.defineProperty(exports, "RedisPresence", { enumerable: true, get: function () { return RedisPresence_1.RedisPresence; } });
// Serializers
var FossilDeltaSerializer_1 = require("./serializer/FossilDeltaSerializer");
Object.defineProperty(exports, "FossilDeltaSerializer", { enumerable: true, get: function () { return FossilDeltaSerializer_1.FossilDeltaSerializer; } });
var SchemaSerializer_1 = require("./serializer/SchemaSerializer");
Object.defineProperty(exports, "SchemaSerializer", { enumerable: true, get: function () { return SchemaSerializer_1.SchemaSerializer; } });
var nonenumerable_1 = require("nonenumerable"); // TODO: remove me on 1.0.0 (FossilDelta stuff)
Object.defineProperty(exports, "nosync", { enumerable: true, get: function () { return nonenumerable_1.nonenumerable; } });
var Utils_1 = require("./Utils");
Object.defineProperty(exports, "generateId", { enumerable: true, get: function () { return Utils_1.generateId; } });
Object.defineProperty(exports, "Deferred", { enumerable: true, get: function () { return Utils_1.Deferred; } });
// Default rooms
var LobbyRoom_1 = require("./rooms/LobbyRoom");
Object.defineProperty(exports, "LobbyRoom", { enumerable: true, get: function () { return LobbyRoom_1.LobbyRoom; } });
var RelayRoom_1 = require("./rooms/RelayRoom");
Object.defineProperty(exports, "RelayRoom", { enumerable: true, get: function () { return RelayRoom_1.RelayRoom; } });
//# sourceMappingURL=index.js.map