"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
class StatusBanner extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            frame: 0
        };
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
        }
        else {
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
        return (<div className='statusBanner'>
				{this.currMessage()}
			</div>);
    }
}
exports.default = StatusBanner;
//# sourceMappingURL=StatusBanner.js.map