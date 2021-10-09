"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const axios_1 = tslib_1.__importDefault(require("axios"));
const ResponseUtils_js_1 = require("./ResponseUtils.js");
class Register extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            userValue: '',
            emailValue: '',
            passwordValue: ''
        };
        this._handleUserChange = this._handleUserChange.bind(this);
        this._handleEmailChange = this._handleEmailChange.bind(this);
        this._handlePasswordChange = this._handlePasswordChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }
    render() {
        return (<form className="form" onSubmit={this._handleSubmit}>
                <div className='form-header'>Join 4D Chess! It's Free!</div>
                <input value={this.state.userValue} onChange={this._handleUserChange} className='form-input' type="text" placeholder="Username" name="username" required/>
                <input value={this.state.emailValue} onChange={this._handleEmailChange} className='form-input' type="text" placeholder="Email" name="email" required/>
                <input value={this.state.passwordValue} onChange={this._handlePasswordChange} className='form-input' type="password" placeholder="Create Password" name="password" required/>
                <button className='form-input form-submit' type="submit">Create Account</button>
                Already have an account? <react_router_dom_1.Link to="/login">Log in here!</react_router_dom_1.Link>
            </form>);
    }
    _handleUserChange(event) {
        this.setState({ userValue: event.target.value });
    }
    _handleEmailChange(event) {
        this.setState({ emailValue: event.target.value });
    }
    _handlePasswordChange(event) {
        this.setState({ passwordValue: event.target.value });
    }
    _handleSubmit(event) {
        event.preventDefault();
        axios_1.default.post('/register', {
            username: this.state.userValue,
            email: this.state.emailValue,
            password: this.state.passwordValue
        }).then(response => {
            console.log(response);
            this.props.alerter({
                variant: 'success',
                content: response.data.message
            });
            this.props.onSuccess(response);
            this.props.triggerExit();
        }).catch(err => {
            if (err.response) {
                // client received an error response (5xx, 4xx)
                console.log('response:', err.response);
                let errors = err.response.data;
                let first = ResponseUtils_js_1.firstError(errors);
                this.props.alerter({
                    variant: 'danger',
                    content: first
                });
            }
            else if (err.request) {
                // client never received a response, or request never left
                console.log('request:', err.request);
                this.props.alerter({
                    variant: 'warning',
                    content: 'Network Error, please try again'
                });
            }
            else {
                this.props.alerter({
                    variant: 'danger',
                    content: `Unknown error ${err}`
                });
            }
        });
    }
}
exports.default = Register;
//# sourceMappingURL=Register.js.map