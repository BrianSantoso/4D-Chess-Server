import React, { Component } from 'react';

class Home extends Component {
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

export default Home;