import React, { Component } from 'react';

class StatusBanner extends Component {
	constructor(props) {
		super(props);
		this.state = {
			frame: 0
		}

		this.tick = this.tick.bind(this);
	}

	tick() {
		this.setState(prevState => ({
			frame: (prevState.frame + 1) % this.props.message.length
		}));
	}

	currMessage() {
		if (typeof this.props.message === 'string') {
			return this.props.message;
		} else {
			return this.props.message[this.state.frame];
		}
	}

	componentDidMount() {
		this.timerID = setInterval(this.tick, config.banner.msPerMsg);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	render() {
		return (
			<div className='statusBanner'>
				{this.currMessage()}
			</div>
		);
	}
}

export default StatusBanner;