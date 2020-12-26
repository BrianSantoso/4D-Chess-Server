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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterNode = exports.registerNode = void 0;
const internal_ip_1 = __importDefault(require("internal-ip"));
const NODES_SET = 'colyseus:nodes';
const DISCOVERY_CHANNEL = 'colyseus:nodes:discovery';
function getNodeAddress(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const host = process.env.SELF_HOSTNAME || (yield internal_ip_1.default.v4());
        const port = process.env.SELF_PORT || node.port;
        return `${node.processId}/${host}:${port}`;
    });
}
function registerNode(presence, node) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodeAddress = yield getNodeAddress(node);
        yield presence.sadd(NODES_SET, nodeAddress);
        yield presence.publish(DISCOVERY_CHANNEL, `add,${nodeAddress}`);
    });
}
exports.registerNode = registerNode;
function unregisterNode(presence, node) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodeAddress = yield getNodeAddress(node);
        yield presence.srem(NODES_SET, nodeAddress);
        yield presence.publish(DISCOVERY_CHANNEL, `remove,${nodeAddress}`);
    });
}
exports.unregisterNode = unregisterNode;
//# sourceMappingURL=index.js.map