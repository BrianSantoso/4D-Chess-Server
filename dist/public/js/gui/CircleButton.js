"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
class CircleButton extends react_1.Component {
    render() {
        return (<a className='game-button' onClick={this.props.handleClick}>
				<img src={this.props.icon}/>
			</a>);
    }
}
exports.default = CircleButton;
//# sourceMappingURL=CircleButton.js.map