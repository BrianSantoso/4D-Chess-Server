"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const online_svg_1 = tslib_1.__importDefault(require("../../assets/player/online.svg"));
const offline_svg_1 = tslib_1.__importDefault(require("../../assets/player/offline.svg"));
const king_white_svg_1 = tslib_1.__importDefault(require("../../assets/player/king_white.svg"));
const king_black_svg_1 = tslib_1.__importDefault(require("../../assets/player/king_black.svg"));
const ChessTeam_js_1 = tslib_1.__importDefault(require("../ChessTeam.js"));
class PlayerInfo extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = props;
        this.props.stateHelper.onStateChange((state) => { this.setState(state); });
    }
    msToHMS(duration) {
        if (typeof duration !== 'number') {
            return '--:--';
        }
        duration = Math.max(0, duration);
        // https://stackoverflow.com/a/54821863
        // let milliseconds = parseInt((duration % 1000) / 100),
        let milliseconds = parseInt((duration % 1000)), seconds = parseInt((duration / 1000) % 60), minutes = parseInt((duration / (1000 * 60)) % 60), hours = parseInt((duration / (1000 * 60 * 60)) % 24);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        if (duration < 60000) {
            let paddingValue = '0';
            let msString = (milliseconds + paddingValue).slice(0, paddingValue.length);
            return seconds + "." + msString;
        }
        else {
            return minutes + ":" + seconds;
        }
    }
    render() {
        let className = 'playerInfo ' + this.state.position;
        let isWhite = this.state.team === ChessTeam_js_1.default.WHITE;
        let playerTime = <div className='playerTime'>{this.msToHMS(this.state.time)}</div>;
        let playerStatus = <img className='playerStatus' src={this.state.online ? online_svg_1.default : offline_svg_1.default}/>;
        let playerIcon = <img className='playerIcon' src={isWhite ? king_white_svg_1.default : king_black_svg_1.default}/>;
        let elo = `(${this.state.elo})`;
        let footer = (<div className='playerFooter'>
				{elo}
				{playerStatus}
				{playerTime}
			</div>);
        return (<div className={className}>
				{playerIcon}
				<div className='playerText'>
					<div className='playerName'>
						{this.state.playerName}
					</div>
					{footer}
				</div>
			</div>);
    }
}
exports.default = PlayerInfo;
//# sourceMappingURL=PlayerInfo.js.map