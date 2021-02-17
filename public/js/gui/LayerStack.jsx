import React, { Component } from 'react';

class LayerStack extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stack: []
        }
        this.props.stateHelper.onStateChange((state) => {this.setState(state)});
    }

    render() {
        return (
            <div className=''>
                {this.state.stack}
            </div>
        );
    }
}