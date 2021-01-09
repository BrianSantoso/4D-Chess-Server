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

export default Popup;