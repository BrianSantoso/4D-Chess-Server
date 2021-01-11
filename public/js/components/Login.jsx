import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Login extends Component {
    render() {
        return (
            <div className="form">
                <div className='form-header'>Log In to 4D Chess</div>
                <input className='form-input' type="text" placeholder="Username or email" name="uname" required />
                <input className='form-input' type="password" placeholder="Password" name="psw" required />
                <button className='form-input form-submit' type="submit">Log In</button>
                Don't have an account? <Link to="/register">Create one here!</Link>
            </div>
        );
    }
}

export default Login;