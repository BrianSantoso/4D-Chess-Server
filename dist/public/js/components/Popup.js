"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_focus_lock_1 = tslib_1.__importDefault(require("react-focus-lock"));
class Popup extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null
        };
        this.triggerExit = this.triggerExit.bind(this);
    }
    triggerExit() {
        this.setState({
            redirect: this.props.redirect
        });
    }
    render() {
        if (this.state.redirect) {
            return <react_router_dom_1.Redirect to={this.state.redirect}/>;
        }
        return (<react_focus_lock_1.default>
                <PopupBg onClickHandler={this.triggerExit}>
                    <div className='popup' onClick={(e) => e.stopPropagation()}>
                        {react_1.default.Children.map(this.props.children, comp => react_1.default.cloneElement(comp, { triggerExit: this.triggerExit }))}
                    </div>
                </PopupBg>
            </react_focus_lock_1.default>);
    }
    componentDidMount() {
        if (this.props.onOpen) {
            this.props.onOpen();
        }
    }
    componentWillUnmount() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }
}
class PopupBg extends react_1.Component {
    render() {
        return (<div className='popup-bg-overlay' onClick={this.props.onClickHandler}>
                {this.props.children}
            </div>);
    }
}
exports.default = Popup;
//# sourceMappingURL=Popup.js.map