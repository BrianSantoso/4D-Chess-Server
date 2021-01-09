import React, { Component } from 'react';

class Popup extends Component {
    render() {
        return (
            <PopupBg handleExit={this.props.handleExit}>
                <div className='popup' onClick={(e) => e.stopPropagation()}>
                    {this.props.children}
                </div>
            </PopupBg>
        );
    }
}

class PopupBg extends Component {
    render() {
        return (
            <div className='popup-bg-overlay' onClick={this.props.handleExit}>
                {this.props.children}
            </div>
        );
    }
}

class Register extends Component {
    render() {
        return (
            <Popup handleExit={this.props.handleExit}>
                <div className="form">
                    <div className='form-header'> Join 4D Chess! </div>
                    <input className='form-input' type="text" placeholder="Username" name="uname" required />
                    <input className='form-input' type="text" placeholder="Email" name="email" id="email" required />
                    <input className='form-input' type="password" placeholder="Create Password" name="psw" required />
                    <button className='form-input form-submit' type="submit">Create Account</button>
                </div>
            </Popup>
        );
    }
}

export default Register;