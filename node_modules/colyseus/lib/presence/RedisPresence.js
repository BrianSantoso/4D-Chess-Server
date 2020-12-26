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
exports.RedisPresence = void 0;
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
class RedisPresence {
    constructor(opts) {
        this.subscriptions = {};
        this.handleSubscription = (channel, message) => {
            if (this.subscriptions[channel]) {
                for (let i = 0, l = this.subscriptions[channel].length; i < l; i++) {
                    this.subscriptions[channel][i](JSON.parse(message));
                }
            }
        };
        this.sub = redis_1.default.createClient(opts);
        this.pub = redis_1.default.createClient(opts);
        // no listener limit
        this.sub.setMaxListeners(0);
        // create promisified pub/sub methods.
        this.subscribeAsync = util_1.promisify(this.sub.subscribe).bind(this.sub);
        this.unsubscribeAsync = util_1.promisify(this.sub.unsubscribe).bind(this.sub);
        this.publishAsync = util_1.promisify(this.pub.publish).bind(this.pub);
        // create promisified redis methods.
        this.smembersAsync = util_1.promisify(this.pub.smembers).bind(this.pub);
        this.sismemberAsync = util_1.promisify(this.pub.sismember).bind(this.pub);
        this.hgetAsync = util_1.promisify(this.pub.hget).bind(this.pub);
        this.hlenAsync = util_1.promisify(this.pub.hlen).bind(this.pub);
        this.pubsubAsync = util_1.promisify(this.pub.pubsub).bind(this.pub);
        this.incrAsync = util_1.promisify(this.pub.incr).bind(this.pub);
        this.decrAsync = util_1.promisify(this.pub.decr).bind(this.pub);
    }
    subscribe(topic, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.subscriptions[topic]) {
                this.subscriptions[topic] = [];
            }
            this.subscriptions[topic].push(callback);
            if (this.sub.listeners('message').length === 0) {
                this.sub.addListener('message', this.handleSubscription);
            }
            yield this.subscribeAsync(topic);
            return this;
        });
    }
    unsubscribe(topic, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const topicCallbacks = this.subscriptions[topic];
            if (!topicCallbacks) {
                return;
            }
            if (callback) {
                const index = topicCallbacks.indexOf(callback);
                topicCallbacks.splice(index, 1);
            }
            else {
                this.subscriptions[topic] = [];
            }
            if (this.subscriptions[topic].length === 0) {
                delete this.subscriptions[topic];
                yield this.unsubscribeAsync(topic);
            }
            return this;
        });
    }
    publish(topic, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data === undefined) {
                data = false;
            }
            yield this.publishAsync(topic, JSON.stringify(data));
        });
    }
    exists(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.pubsubAsync('channels', roomId)).length > 0;
        });
    }
    setex(key, value, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => this.pub.setex(key, seconds, value, resolve));
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.pub.get(key, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    del(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.pub.del(roomId, resolve);
            });
        });
    }
    sadd(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.pub.sadd(key, value, resolve);
            });
        });
    }
    smembers(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.smembersAsync(key);
        });
    }
    sismember(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sismemberAsync(key, field);
        });
    }
    srem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.pub.srem(key, value, resolve);
            });
        });
    }
    scard(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.pub.scard(key, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    sinter(...keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.pub.sinter(...keys, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        });
    }
    hset(key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.pub.hset(key, field, value, resolve);
            });
        });
    }
    hincrby(key, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.pub.hincrby(key, field, value, resolve);
            });
        });
    }
    hget(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.hgetAsync(key, field);
        });
    }
    hgetall(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.pub.hgetall(key, (err, values) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(values);
                });
            });
        });
    }
    hdel(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.pub.hdel(key, field, (err, ok) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(ok);
                });
            });
        });
    }
    hlen(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.hlenAsync(key);
        });
    }
    incr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.incrAsync(key);
        });
    }
    decr(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.decrAsync(key);
        });
    }
}
exports.RedisPresence = RedisPresence;
//# sourceMappingURL=RedisPresence.js.map