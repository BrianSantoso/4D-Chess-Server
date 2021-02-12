import React, { Component } from 'react';

class CircleButton extends Component {
	render() {
		return (
			<a className='game-button' onClick={this.props.handleClick}>
				<img src={this.props.icon} />
			</a>
		)
	}
}

export default CircleButton;