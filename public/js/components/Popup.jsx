import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import FocusLock from 'react-focus-lock';

class Popup extends Component {
    render() {
        return (
            <FocusLock>
                <PopupBg redirect={this.props.redirect}>
                    <div className='popup' onClick={(e) => e.stopPropagation()}>
                        {this.props.children}
                    </div>
                </PopupBg>
            </FocusLock>
        );
    }

    componentDidMount() {
        if (this.props.onOpen) {
            this.props.onOpen();
        }
    }

    componentWillUnmount() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }
}

class PopupBg extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null
        }
        this.onExit = this.onExit.bind(this);
    }
    onExit() {
        this.setState({
            redirect: this.props.redirect
        });
    }
    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div className='popup-bg-overlay' onClick={this.onExit}>
                {this.props.children}
            </div>
        );
    }
}

export default Popup;