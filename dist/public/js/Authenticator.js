"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
class Authenticator {
    // Account manager
    constructor() {
        this._subscribers = [];
    }
    subscribe(obj) {
        // TODO: dispatchAccountChange on subscription to trigger update within obj?
        this._subscribers.push(obj);
        this._dispatchTo(obj, 'onSubscribe');
    }
    _dispatch(event, ...args) {
        this._subscribers.forEach(subscriber => {
            this._dispatchTo(subscriber, event, ...args);
        });
    }
    _dispatchTo(subscriber, event, ...args) {
        let method = subscriber[event];
        if (method) {
            method.call(subscriber, ...args);
        }
        else {
            console.log(event, 'method not found on', subscriber);
        }
    }
    async init() {
        let token = this.getAuthToken();
        if (!token) { // if empty string or no authToken field in localStorage
            token = await this.retrieveGuestToken();
        }
        console.log('Retrieved authToken:', token);
        this.setAuthToken(token);
    }
    async retrieveGuestToken() {
        return axios_1.default.get('/register/guest').then(response => {
            let token = response.data.token;
            console.log('Received guest authToken:', token);
            return token;
        }).catch(err => {
            console.log('Failed to retrieve guest authToken', err);
            // console.log('Retrying request to receive guest token')
            // return this.retrieveGuestToken();
            return err;
        });
    }
    async register(username, email, password, onSuccess = () => { }, onError = () => { }) {
        return axios_1.default.post('/register', {
            username: username,
            email: email,
            password: password
        }).then(response => {
            console.log(response);
            onSuccess({
                variant: 'success',
                content: response.data.message
            });
            this.setAuthToken(response.data.authToken);
            // this.props.onSuccess(response);
            return response;
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response);
                let errors = err.response.data;
                let first = firstError(errors);
                onError({
                    variant: 'danger',
                    content: first
                });
            }
            else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request);
                onError({
                    variant: 'warning',
                    content: 'Network Error, please try again'
                });
            }
            else {
                onError({
                    variant: 'danger',
                    content: `Unknown error ${err}`
                });
            }
            return err;
        });
    }
    async login(username, password, onSuccess = () => { }, onError = () => { }) {
        return axios_1.default.post('/login', {
            usernameOrEmail: username,
            password: password
        }).then(response => {
            console.log(response);
            let token = response.data.token;
            this.setAuthToken(token);
            onSuccess({
                variant: 'success',
                content: response.data.message
            });
            return token;
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response);
                let errors = err.response.data;
                let first = firstError(errors);
                onError({
                    variant: 'danger',
                    content: first
                });
            }
            else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request);
                onError({
                    variant: 'warning',
                    content: 'Network Error, please try again'
                });
            }
            else {
                onError({
                    variant: 'danger',
                    content: `Unknown error ${err}`
                });
            }
            return err;
        });
    }
    async logout() {
        // localStorage.removeItem('authToken');
        this.setAuthToken('');
        return await this.initAuthToken();
        // TODO: tell gamemanager to rejoin room.
    }
    async setAuthToken(jwtString) {
        let token = jwtString;
        localStorage.setItem('authToken', token);
        console.log('authToken set to:', token);
        try {
            let decoded = jsonwebtoken_1.default.decode(token, { complete: true });
            console.log('(decoded ver=)', decoded);
        }
        catch (_a) {
        }
        this._dispatch('onAccountChange', token);
        return token;
    }
    getAuthToken() {
        return localStorage.getItem('authToken');
    }
    getDecodedAuthToken(property) {
        let token = this.getAuthToken();
        let decoded = Authenticator.decode(token);
        if (decoded) {
            if (property) {
                return decoded[property];
            }
            else {
                return decoded;
            }
        }
        else {
            return null;
        }
    }
    loggedIn() {
        let decoded = this.getDecodedAuthToken();
        return decoded && decoded.registered;
    }
}
Authenticator.decode = (authToken) => {
    const decoded = jsonwebtoken_1.default.decode(authToken, { complete: true });
    if (decoded) {
        return decoded.payload;
    }
    else {
        console.log('Malformed authToken:', token);
        return null;
    }
};
exports.default = Authenticator;
//# sourceMappingURL=Authenticator.js.map