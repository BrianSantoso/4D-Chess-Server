"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
class Logout extends react_1.Component {
    constructor(props) {
        super(props);
        this._handleSubmit = this._handleSubmit.bind(this);
    }
    _handleSubmit(event) {
        event.preventDefault();
        this.props.alerter({
            variant: 'success',
            content: 'Logged out!'
        });
        this.props.onSuccess();
        this.props.triggerExit();
        // TODO: tell server that you just logged out to update lastLogout
    }
    render() {
        return (<form className="form" onSubmit={this._handleSubmit}>
                <div className='form-header'>Are you sure you want to log out?</div>
                <button className='form-input form-submit' type="submit">Log out</button>
            </form>);
    }
}
exports.default = Logout;
//# sourceMappingURL=Logout.js.map