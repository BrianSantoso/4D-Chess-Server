import React, { Component } from 'react';
import OnlineIcon from '../../assets/player/online.svg';
import OfflineIcon from '../../assets/player/offline.svg';
import WhiteIcon from '../../assets/player/king_white.svg';
import BlackIcon from '../../assets/player/king_black.svg';
import ChessTeam from '../ChessTeam.js';

class PlayerInfo extends Component {
	
	constructor(props) {
		super(props);
	}
	
	msToHMS(duration) {
		if (typeof duration !== 'number') {
			return '--:--'
		}
		duration = Math.max(0, duration);
		// https://stackoverflow.com/a/54821863
		// let milliseconds = parseInt((duration % 1000) / 100),
		let milliseconds = parseInt((duration % 1000)),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;
		
		if (duration < 60000) {
			let paddingValue = '0'
			let msString = (milliseconds + paddingValue).slice(0, paddingValue.length);
			return seconds + "." + msString
		} else {
			return minutes + ":" + seconds;
		}
	}
	
	render() {
		let className = 'playerInfo ' + this.props.position;
		let isWhite = this.props.team === ChessTeam.WHITE;
		let playerTime = <div className='playerTime'>{this.msToHMS(this.props.time)}</div>;
		let playerStatus = <img className='playerStatus' src={this.props.online ? OnlineIcon : OfflineIcon} />
		let playerIcon = <img className='playerIcon' src={isWhite ? WhiteIcon : BlackIcon}/>;
		let elo = `(${this.props.elo})`;
		let footer = (
			<div className='playerFooter'>
				{elo}
				{playerStatus}
				{playerTime}
			</div>
		);
		
		return (
			<div className={className}>
				{playerIcon}
				<div className='playerText'>
					<div className='playerName'>
						{this.props.playerName}
					</div>
					{footer}
				</div>
			</div>
		)
	}
}

export default PlayerInfo;