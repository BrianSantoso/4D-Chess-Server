import React, { Component } from 'react';

class Play extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    render() {
        return '';
    }
}

export default Play;