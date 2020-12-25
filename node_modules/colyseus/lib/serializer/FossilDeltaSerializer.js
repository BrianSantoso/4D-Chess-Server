"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FossilDeltaSerializer = void 0;
const schema_1 = require("@colyseus/schema");
const fossil_delta_1 = __importDefault(require("fossil-delta"));
const notepack_io_1 = __importDefault(require("notepack.io"));
const Protocol_1 = require("../Protocol");
const fast_json_patch_1 = __importDefault(require("fast-json-patch")); // this is only used for debugging patches
const Debug_1 = require("../Debug");
class FossilDeltaSerializer {
    constructor() {
        this.id = 'fossil-delta';
    }
    reset(newState) {
        this.previousState = newState;
        this.previousStateEncoded = notepack_io_1.default.encode(this.previousState);
    }
    getFullState(_) {
        return this.previousStateEncoded;
    }
    applyPatches(clients, previousState) {
        const hasChanged = this.hasChanged(previousState);
        if (hasChanged) {
            this.patches.unshift(Protocol_1.Protocol.ROOM_STATE_PATCH);
            let numClients = clients.length;
            while (numClients--) {
                const client = clients[numClients];
                client.enqueueRaw(this.patches);
            }
        }
        return hasChanged;
    }
    hasChanged(newState) {
        const currentState = newState;
        let changed = false;
        let currentStateEncoded;
        /**
         * allow optimized state changes when using `Schema` class.
         */
        if (newState instanceof schema_1.Schema) {
            if (newState['$changes'].changes.size > 0) { // tslint:disable-line
                changed = true;
                currentStateEncoded = notepack_io_1.default.encode(currentState);
            }
        }
        else {
            currentStateEncoded = notepack_io_1.default.encode(currentState);
            changed = !currentStateEncoded.equals(this.previousStateEncoded);
        }
        if (changed) {
            this.patches = fossil_delta_1.default.create(this.previousStateEncoded, currentStateEncoded);
            //
            // debugging
            //
            if (Debug_1.debugPatch.enabled) {
                Debug_1.debugPatch('%d bytes, %j', this.patches.length, fast_json_patch_1.default.compare(notepack_io_1.default.decode(this.previousStateEncoded), currentState));
            }
            this.previousState = currentState;
            this.previousStateEncoded = currentStateEncoded;
        }
        return changed;
    }
}
exports.FossilDeltaSerializer = FossilDeltaSerializer;
//# sourceMappingURL=FossilDeltaSerializer.js.map