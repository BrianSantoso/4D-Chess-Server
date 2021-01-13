import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import FocusLock from 'react-focus-lock';

class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null
        }
        this.triggerExit = this.triggerExit.bind(this);
    }
    triggerExit() {
        this.setState({
            redirect: this.props.redirect
        });
    }
    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <FocusLock>
                <PopupBg onClickHandler={this.triggerExit}>
                    <div className='popup' onClick={(e) => e.stopPropagation()}>
                        {React.Children.map(this.props.children, comp => React.cloneElement(comp, { triggerExit: this.triggerExit }))}
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
    render() {
        return (
            <div className='popup-bg-overlay' onClick={this.props.onClickHandler}>
                {this.props.children}
            </div>
        );
    }
}

export default Popup;