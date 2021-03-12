import axios from "axios";
import jwt from 'jsonwebtoken';

class Authenticator {

    constructor() {
        this._subscribers = [];
    }
    
    subscribe(obj) {
        this._subscribers.push(obj);
    }

    _dispatchAccountChange(newToken) {
        this._subscribers.forEach(subscriber => {
            let method = subscriber.onAccountChange;
            if (method) {
                method.call(subscriber, newToken);
            }
        });
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
        return axios.get('/register/guest').then(response => {
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

    async register(username, email, password, onSuccess=()=>{}, onError=()=>{}) {
        return axios.post('/register', {
            username: username,
            email: email,
            password: password
        }).then(response => {
            console.log(response);
            onSuccess({
                variant: 'success',
                content: response.data.message
            });
            // this.props.onSuccess(response);
            return response;
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response)
                let errors = err.response.data;
                let first = firstError(errors);
                onError({
                    variant: 'danger',
                    content: first
                });
            } else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request)
                onError({
                    variant: 'warning',
                    content: 'Network Error, please try again'
                });
            } else {
                onError({
                    variant: 'danger',
                    content: `Unknown error ${err}`
                });
            }
            return err;
        });
    }

    async login(username, password, onSuccess=()=>{}, onError=()=>{}) {
        return axios.post('/login', {
            usernameOrEmail: username,
            password: password
        }).then(response => {
            console.log(response)
            onSuccess({
                variant: 'success',
                content: response.data.message
            });
            return response.data.token;
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response)
                let errors = err.response.data;
                let first = firstError(errors);
                onError({
                    variant: 'danger',
                    content: first
                });
            } else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request)
                onError({
                    variant: 'warning',
                    content: 'Network Error, please try again'
                });
            } else {
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
        console.log('authToken set to:', token)
        try {
            let decoded = jwt.decode(token, {complete: true});
            console.log('(decoded ver=)', decoded)
        } catch {

        }

        this._dispatchAccountChange(token);
        
        return token;
	}

    getAuthToken() {
        return localStorage.getItem('authToken');
    }
}

export default Authenticator;