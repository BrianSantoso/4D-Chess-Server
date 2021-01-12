import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userValue: '',
            emailValue: '',
            passwordValue: '',
            alert: ''
        };

        this._handleUserChange = this._handleUserChange.bind(this);
        this._handleEmailChange = this._handleEmailChange.bind(this);
        this._handlePasswordChange = this._handlePasswordChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }
    render() {
        return (
            <form className="form" onSubmit={this._handleSubmit}>
                <div className='form-header'>Join 4D Chess! It's Free!</div>
                <input value={this.state.userValue} onChange={this._handleUserChange} className='form-input' type="text" placeholder="Username" name="username" required />
                <input value={this.state.emailValue} onChange={this._handleEmailChange} className='form-input' type="text" placeholder="Email" name="email" required />
                <input value={this.state.passwordValue} onChange={this._handlePasswordChange} className='form-input' type="password" placeholder="Create Password" name="password" required />
                <button className='form-input form-submit' type="submit">Create Account</button>
                Already have an account? <Link to="/login">Log in here!</Link>
                {this.state.alert}
            </form>
        );
    }

    _handleUserChange(event) {
		this.setState({userValue: event.target.value});
    }
    
    _handleEmailChange(event) {
		this.setState({emailValue: event.target.value});
    }

    _handlePasswordChange(event) {
		this.setState({passwordValue: event.target.value});
	}

    _handleSubmit(event) {
        event.preventDefault();
        axios.post('/register', {
            username: this.state.userValue,
            email: this.state.emailValue,
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
    }
}

export default Register;