import axios from "axios";
import jwt from 'jsonwebtoken';

class Authenticator {
    async initAuthToken() {
		let token = this.getAuthToken();

		if (token) {
			console.log('Retrieved Cached authToken:', token);
			return this.setAuthToken(token);
			// TODO: tell server to update last login
		} else {
			return this.setAuthToken(retrieveGuestToken());
		}
	}

    async retrieveGuestToken() {
        return axios.get('/register/guest').then(response => {
            token = response.data.token;
            console.log('Received guest authToken:', token);
            return token;
        }).catch(err => {
            console.log('Failed to retrieve guest authToken', err);
            console.log('Retrying request to receive guest token')
            return this.retrieveGuestToken();
        });
    }

    async register(username, email, password) {
        return axios.post('/register', {
            username: username,
            email: email,
            password: password
        }).then(response => {
            console.log(response);
            return {
                variant: 'success',
                content: response.data.message
            };
            // this.props.onSuccess(response);
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response)
                let errors = err.response.data;
                let first = firstError(errors);
                return {
                    variant: 'danger',
                    content: first
                };
            } else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request)
                return {
                    variant: 'warning',
                    content: 'Network Error, please try again'
                };
            } else {
                return {
                    variant: 'danger',
                    content: `Unknown error ${err}`
                };
            }
        });
    }

    async login(username, password) {
        return axios.post('/login', {
            usernameOrEmail: username,
            password: password
        }).then(response => {
            console.log(response)
            return response.data.token;
            // return {
            //     variant: 'success',
            //     content: response.data.message
            // };
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response)
                let errors = err.response.data;
                let first = firstError(errors);
                return {
                    variant: 'danger',
                    content: first
                };
            } else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request)
                return {
                    variant: 'warning',
                    content: 'Network Error, please try again'
                };
            } else {
                return {
                    variant: 'danger',
                    content: `Unknown error ${err}`
                };
            }
        });
    }

    async logout() {
		localStorage.removeItem('authToken');
		return await this.initAuthToken();
		// TODO: tell gamemanager to rejoin room.
	}

	async setAuthToken(jwtString) {
		let token = jwtString;
		try {
			let decoded = jwt.decode(token, {complete: true});
			// this.game.setAuthToken(token);
			localStorage.setItem('authToken', token);
			console.log('authToken set: (decoded ver=)', decoded)
			const notAGuest = decoded.payload.registered;
			// this.setState({
			// 	loggedIn: notAGuest
			// });
		} catch {
			console.error('Malformed authToken, logging out');
			return this.logout();
		}
	}

    getAuthToken() {
        return localStorage.getItem('authToken');
    }
}

export default Authenticator;