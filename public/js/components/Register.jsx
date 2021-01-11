import React, { Component } from 'react';

class Register extends Component {
    render() {
        return (
            <div className="form">
                <div className='form-header'>Join 4D Chess! It's Free!</div>
                <input className='form-input' type="text" placeholder="Username" name="uname" required />
                <input className='form-input' type="text" placeholder="Email" name="email" required />
                <input className='form-input' type="password" placeholder="Create Password" name="psw" required />
                <button className='form-input form-submit' type="submit">Create Account</button>
            </div>
        );
    }
}

export default Register;