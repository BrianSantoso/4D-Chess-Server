"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
class Play extends react_1.Component {
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
exports.default = Play;
//# sourceMappingURL=Play.js.map