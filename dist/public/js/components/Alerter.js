"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
class Alerter extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = props;
        this.props.stateHelper.onStateChange((state) => { this.setState(state); });
    }
    render() {
        if (this.state.showing.length == 0) {
            return null;
        }
        else {
            return this.state.showing[this.state.showing.length - 1];
        }
    }
}
exports.default = Alerter;
//# sourceMappingURL=Alerter.js.map