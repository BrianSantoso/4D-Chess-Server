"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveSeatFor = exports.gracefullyShutdown = exports.getRoomById = exports.createRoom = exports.hasHandler = exports.removeRoomType = exports.defineRoomType = exports.remoteRoomCall = exports.findOneRoomAvailable = exports.query = exports.joinById = exports.join = exports.create = exports.joinOrCreate = exports.setup = exports.driver = exports.presence = exports.processId = void 0;
const Protocol_1 = require("./Protocol");
const IPC_1 = require("./IPC");
const Utils_1 = require("./Utils");
const RegisteredHandler_1 = require("./matchmaker/RegisteredHandler");
const Room_1 = require("./Room");
const LocalPresence_1 = require("./presence/LocalPresence");
const Debug_1 = require("./Debug");
const SeatReservationError_1 = require("./errors/SeatReservationError");
const ServerError_1 = require("./errors/ServerError");
const LocalDriver_1 = require("./matchmaker/drivers/LocalDriver");
const handlers = {};
const rooms = {};
let isGracefullyShuttingDown;
function setup(_presence, _driver, _processId) {
    exports.presence = _presence || new LocalPresence_1.LocalPresence();
    exports.driver = _driver || new LocalDriver_1.LocalDriver();
    exports.processId = _processId;
    isGracefullyShuttingDown = false;
    /**
     * Subscribe to remote `handleCreateRoom` calls.
     */
    IPC_1.subscribeIPC(exports.presence, exports.processId, getProcessChannel(), (_, args) => {
        return handleCreateRoom.apply(undefined, args);
    });
    exports.presence.hset(getRoomCountKey(), exports.processId, '0');
}
exports.setup = setup;
/**
 * Join or create into a room and return seat reservation
 */
function joinOrCreate(roomName, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Utils_1.retry(() => __awaiter(this, void 0, void 0, function* () {
            let room = yield findOneRoomAvailable(roomName, options);
            if (!room) {
                room = yield createRoom(roomName, options);
            }
            return yield reserveSeatFor(room, options);
        }), 5, [SeatReservationError_1.SeatReservationError]);
    });
}
exports.joinOrCreate = joinOrCreate;
/**
 * Create a room and return seat reservation
 */
function create(roomName, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield createRoom(roomName, options);
        return reserveSeatFor(room, options);
    });
}
exports.create = create;
/**
 * Join a room and return seat reservation
 */
function join(roomName, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Utils_1.retry(() => __awaiter(this, void 0, void 0, function* () {
            const room = yield findOneRoomAvailable(roomName, options);
            if (!room) {
                throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_INVALID_CRITERIA, `no rooms found with provided criteria`);
            }
            return reserveSeatFor(room, options);
        }));
    });
}
exports.join = join;
/**
 * Join a room by id and return seat reservation
 */
function joinById(roomId, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield exports.driver.findOne({ roomId });
        if (room) {
            const rejoinSessionId = options.sessionId;
            if (rejoinSessionId) {
                // handle re-connection!
                const hasReservedSeat = yield remoteRoomCall(room.roomId, 'hasReservedSeat', [rejoinSessionId]);
                if (hasReservedSeat) {
                    return { room, sessionId: rejoinSessionId };
                }
                else {
                    throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_EXPIRED, `session expired: ${rejoinSessionId}`);
                }
            }
            else if (!room.locked) {
                return reserveSeatFor(room, options);
            }
            else {
                throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_INVALID_ROOM_ID, `room "${roomId}" is locked`);
            }
        }
        else {
            throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_INVALID_ROOM_ID, `room "${roomId}" not found`);
        }
    });
}
exports.joinById = joinById;
/**
 * Perform a query for all cached rooms
 */
function query(conditions = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.driver.find(conditions);
    });
}
exports.query = query;
/**
 * Find for a public and unlocked room available
 */
function findOneRoomAvailable(roomName, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield awaitRoomAvailable(roomName, () => __awaiter(this, void 0, void 0, function* () {
            const handler = handlers[roomName];
            if (!handler) {
                throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_NO_HANDLER, `provided room name "${roomName}" not defined`);
            }
            const roomQuery = exports.driver.findOne(Object.assign({ locked: false, name: roomName, private: false }, handler.getFilterOptions(options)));
            if (handler.sortOptions) {
                roomQuery.sort(handler.sortOptions);
            }
            return yield roomQuery;
        }));
    });
}
exports.findOneRoomAvailable = findOneRoomAvailable;
/**
 * Call a method or return a property on a remote room.
 */
function remoteRoomCall(roomId, method, args, rejectionTimeout = Utils_1.REMOTE_ROOM_SHORT_TIMEOUT) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = rooms[roomId];
        if (!room) {
            try {
                return yield IPC_1.requestFromIPC(exports.presence, getRoomChannel(roomId), method, args);
            }
            catch (e) {
                const request = `${method}${args && ' with args ' + JSON.stringify(args) || ''}`;
                throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_UNHANDLED, `remote room (${roomId}) timed out, requesting "${request}". (${rejectionTimeout}ms exceeded)`);
            }
        }
        else {
            return (!args && typeof (room[method]) !== 'function')
                ? room[method]
                : (yield room[method].apply(room, args));
        }
    });
}
exports.remoteRoomCall = remoteRoomCall;
function defineRoomType(name, klass, defaultOptions) {
    const registeredHandler = new RegisteredHandler_1.RegisteredHandler(klass, defaultOptions);
    handlers[name] = registeredHandler;
    cleanupStaleRooms(name);
    return registeredHandler;
}
exports.defineRoomType = defineRoomType;
function removeRoomType(name) {
    delete handlers[name];
    cleanupStaleRooms(name);
}
exports.removeRoomType = removeRoomType;
function hasHandler(name) {
    return handlers[name] !== undefined;
}
exports.hasHandler = hasHandler;
/**
 * Create a room
 */
function createRoom(roomName, clientOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomsSpawnedByProcessId = yield exports.presence.hgetall(getRoomCountKey());
        const processIdWithFewerRooms = (Object.keys(roomsSpawnedByProcessId).sort((p1, p2) => {
            return (Number(roomsSpawnedByProcessId[p1]) > Number(roomsSpawnedByProcessId[p2]))
                ? 1
                : -1;
        })[0]) || exports.processId;
        if (processIdWithFewerRooms === exports.processId) {
            // create the room on this process!
            return yield handleCreateRoom(roomName, clientOptions);
        }
        else {
            // ask other process to create the room!
            let room;
            try {
                room = yield IPC_1.requestFromIPC(exports.presence, getProcessChannel(processIdWithFewerRooms), undefined, [roomName, clientOptions], Utils_1.REMOTE_ROOM_SHORT_TIMEOUT);
            }
            catch (e) {
                // if other process failed to respond, create the room on this process
                Debug_1.debugAndPrintError(e);
                room = yield handleCreateRoom(roomName, clientOptions);
            }
            return room;
        }
    });
}
exports.createRoom = createRoom;
function handleCreateRoom(roomName, clientOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const registeredHandler = handlers[roomName];
        if (!registeredHandler) {
            throw new ServerError_1.ServerError(Protocol_1.ErrorCode.MATCHMAKE_NO_HANDLER, `provided room name "${roomName}" not defined`);
        }
        const room = new registeredHandler.klass();
        // set room public attributes
        room.roomId = Utils_1.generateId();
        room.roomName = roomName;
        room.presence = exports.presence;
        // create a RoomCache reference.
        room.listing = exports.driver.createInstance(Object.assign({ name: roomName, processId: exports.processId }, registeredHandler.getFilterOptions(clientOptions)));
        if (room.onCreate) {
            try {
                yield room.onCreate(Utils_1.merge({}, clientOptions, registeredHandler.options));
                // increment amount of rooms this process is handling
                exports.presence.hincrby(getRoomCountKey(), exports.processId, 1);
            }
            catch (e) {
                Debug_1.debugAndPrintError(e);
                throw new ServerError_1.ServerError(e.code || Protocol_1.ErrorCode.MATCHMAKE_UNHANDLED, e.message);
            }
        }
        room.internalState = Room_1.RoomInternalState.CREATED;
        room.listing.roomId = room.roomId;
        room.listing.maxClients = room.maxClients;
        // imediatelly ask client to join the room
        Debug_1.debugMatchMaking('spawning \'%s\', roomId: %s, processId: %s', roomName, room.roomId, exports.processId);
        room._events.on('lock', lockRoom.bind(this, room));
        room._events.on('unlock', unlockRoom.bind(this, room));
        room._events.on('join', onClientJoinRoom.bind(this, room));
        room._events.on('leave', onClientLeaveRoom.bind(this, room));
        room._events.once('dispose', disposeRoom.bind(this, roomName, room));
        room._events.once('disconnect', () => room._events.removeAllListeners());
        // room always start unlocked
        yield createRoomReferences(room, true);
        yield room.listing.save();
        registeredHandler.emit('create', room);
        return room.listing;
    });
}
function getRoomById(roomId) {
    return rooms[roomId];
}
exports.getRoomById = getRoomById;
function gracefullyShutdown() {
    if (isGracefullyShuttingDown) {
        return Promise.reject('already_shutting_down');
    }
    isGracefullyShuttingDown = true;
    Debug_1.debugMatchMaking(`${exports.processId} is shutting down!`);
    // remove processId from room count key
    exports.presence.hdel(getRoomCountKey(), exports.processId);
    // unsubscribe from process id channel
    exports.presence.unsubscribe(getProcessChannel());
    const promises = [];
    for (const roomId in rooms) {
        if (!rooms.hasOwnProperty(roomId)) {
            continue;
        }
        promises.push(rooms[roomId].disconnect());
    }
    return Promise.all(promises);
}
exports.gracefullyShutdown = gracefullyShutdown;
/**
 * Reserve a seat for a client in a room
 */
function reserveSeatFor(room, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionId = Utils_1.generateId();
        Debug_1.debugMatchMaking('reserving seat. sessionId: \'%s\', roomId: \'%s\', processId: \'%s\'', sessionId, room.roomId, exports.processId);
        let successfulSeatReservation;
        try {
            successfulSeatReservation = yield remoteRoomCall(room.roomId, '_reserveSeat', [sessionId, options]);
        }
        catch (e) {
            Debug_1.debugMatchMaking(e);
            successfulSeatReservation = false;
        }
        if (!successfulSeatReservation) {
            throw new SeatReservationError_1.SeatReservationError(`${room.roomId} is already full.`);
        }
        return { room, sessionId };
    });
}
exports.reserveSeatFor = reserveSeatFor;
function cleanupStaleRooms(roomName) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // clean-up possibly stale room ids
        // (ungraceful shutdowns using Redis can result on stale room ids still on memory.)
        //
        const cachedRooms = yield exports.driver.find({ name: roomName }, { _id: 1 });
        // remove connecting counts
        yield exports.presence.del(getHandlerConcurrencyKey(roomName));
        yield Promise.all(cachedRooms.map((room) => __awaiter(this, void 0, void 0, function* () {
            try {
                // use hardcoded short timeout for cleaning up stale rooms.
                yield remoteRoomCall(room.roomId, 'roomId');
            }
            catch (e) {
                Debug_1.debugMatchMaking(`cleaning up stale room '${roomName}', roomId: ${room.roomId}`);
                room.remove();
            }
        })));
    });
}
function createRoomReferences(room, init = false) {
    return __awaiter(this, void 0, void 0, function* () {
        rooms[room.roomId] = room;
        if (init) {
            yield IPC_1.subscribeIPC(exports.presence, exports.processId, getRoomChannel(room.roomId), (method, args) => {
                return (!args && typeof (room[method]) !== 'function')
                    ? room[method]
                    : room[method].apply(room, args);
            });
        }
        return true;
    });
}
function awaitRoomAvailable(roomToJoin, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const concurrencyKey = getHandlerConcurrencyKey(roomToJoin);
            const concurrency = (yield exports.presence.incr(concurrencyKey)) - 1;
            // avoid having too long timeout if 10+ clients ask to join at the same time
            const concurrencyTimeout = Math.min(concurrency * 100, Utils_1.REMOTE_ROOM_SHORT_TIMEOUT);
            if (concurrency > 0) {
                Debug_1.debugMatchMaking('receiving %d concurrent requests for joining \'%s\' (waiting %d ms)', concurrency, roomToJoin, concurrencyTimeout);
            }
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield callback();
                    resolve(result);
                }
                catch (e) {
                    reject(e);
                }
                finally {
                    yield exports.presence.decr(concurrencyKey);
                }
            }), concurrencyTimeout);
        }));
    });
}
function onClientJoinRoom(room, client) {
    handlers[room.roomName].emit('join', room, client);
}
function onClientLeaveRoom(room, client, willDispose) {
    handlers[room.roomName].emit('leave', room, client, willDispose);
}
function lockRoom(room) {
    // emit public event on registered handler
    handlers[room.roomName].emit('lock', room);
}
function unlockRoom(room) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield createRoomReferences(room)) {
            // emit public event on registered handler
            handlers[room.roomName].emit('unlock', room);
        }
    });
}
function disposeRoom(roomName, room) {
    return __awaiter(this, void 0, void 0, function* () {
        Debug_1.debugMatchMaking('disposing \'%s\' (%s) on processId \'%s\'', roomName, room.roomId, exports.processId);
        // decrease amount of rooms this process is handling
        if (!isGracefullyShuttingDown) {
            exports.presence.hincrby(getRoomCountKey(), exports.processId, -1);
        }
        // remove from room listing (already removed if `disconnect()` has been called)
        if (room.internalState !== Room_1.RoomInternalState.DISCONNECTING) {
            yield room.listing.remove();
        }
        // emit disposal on registered session handler
        handlers[roomName].emit('dispose', room);
        // remove concurrency key
        exports.presence.del(getHandlerConcurrencyKey(roomName));
        // unsubscribe from remote connections
        exports.presence.unsubscribe(getRoomChannel(room.roomId));
        // remove actual room reference
        delete rooms[room.roomId];
    });
}
//
// Presence keys
//
function getRoomChannel(roomId) {
    return `$${roomId}`;
}
function getHandlerConcurrencyKey(name) {
    return `c:${name}`;
}
function getProcessChannel(id = exports.processId) {
    return `p:${id}`;
}
function getRoomCountKey() {
    return 'roomcount';
}
//# sourceMappingURL=MatchMaker.js.map