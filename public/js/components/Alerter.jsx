import React, { Component } from 'react';

class Alerter extends Component {
    constructor(props) {
        super(props);
        this.state = props;
        this.props.stateHelper.onStateChange((state) => {this.setState(state)});
    }

    render() {
        if (this.state.showing.length == 0) {
            return null;
        } else {
            return this.state.showing[this.state.showing.length - 1];
        }
    }
}

export default Alerter;