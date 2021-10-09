"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
class LayerStack extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            stack: []
        };
        this.props.stateHelper.onStateChange((state) => { this.setState(state); });
    }
    render() {
        return (<div className=''>
                {this.state.stack}
            </div>);
    }
}
//# sourceMappingURL=LayerStack.js.map