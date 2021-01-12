import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userValue: '',
            passwordValue: '',
            alert: ''
        };

        this._handleUserChange = this._handleUserChange.bind(this);
        this._handlePasswordChange = this._handlePasswordChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }
    
    render() {
        return (
            <form className="form" onSubmit={this._handleSubmit}>
                <div className='form-header'>Log In to 4D Chess</div>
                <input value={this.state.userValue} onChange={this._handleUserChange} className='form-input' type="text" placeholder="Username or email" name="uname" required />
                <input value={this.state.passwordValue} onChange={this._handlePasswordChange} className='form-input' type="password" placeholder="Password" name="psw" required />
                <button className='form-input form-submit' type="submit">Log In</button>
                Don't have an account? <Link to="/register">Create one here!</Link>
                {this.state.alert}
            </form>
        );
    }

    _handleUserChange(event) {
		this.setState({userValue: event.target.value});
    }
    
    _handlePasswordChange(event) {
		this.setState({passwordValue: event.target.value});
	}

    _handleSubmit(event) {
        event.preventDefault();
        axios.post('/login', {
            usernameOrEmail: this.state.userValue,
            password: this.state.passwordValue
        }).then(response => {
            console.log(response);
            this.setState({
                alert: <Alert className="alert" variant="success"> {response.data} </Alert>
            });
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response)
                let errors = err.response.data;
                let firstError;
                for (let errField in errors) {
                    firstError = errors[errField];
                    break;
                }
                this.setState({
                    alert: <Alert className="alert" variant="danger"> {firstError} </Alert>
                });
            } else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request)
                this.setState({
                    alert: <Alert className="alert" variant="warning"> Network Error, please try again </Alert>
                });
            } else {
                this.setState({
                    alert: <Alert className="alert" variant="danger"> Unknown error {err} </Alert>
                });
            }
        });
        // fetch('/login', {
        //     method: 'POST',
        //     body: {
        //         usernameOrEmail: this.state.userValue,
        //         password: this.state.passwordValue
        //     }
        // }).then(response => {
        //     console.log(response)
        // }).catch(err => console.log(err));
    }
}

export default Login;