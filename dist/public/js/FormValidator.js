"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669
const validator_1 = tslib_1.__importDefault(require("validator"));
const is_empty_1 = tslib_1.__importDefault(require("is-empty"));
class FormValidator {
    constructor(dontUse = []) {
        this.dontUse = dontUse;
        this.checks = {};
    }
    validate(data) {
        let errors = {};
        // Convert empty fields to an empty string so we can use validator functions
        data.username = !is_empty_1.default(data.username) ? data.username : "";
        data.email = !is_empty_1.default(data.email) ? data.email : "";
        data.usernameOrEmail = !is_empty_1.default(data.usernameOrEmail) ? data.usernameOrEmail : "";
        data.password = !is_empty_1.default(data.password) ? data.password : "";
        data.password2 = !is_empty_1.default(data.password2) ? data.password2 : "";
        // username checks
        if (validator_1.default.isEmpty(data.username)) {
            errors.username = "Username field is required!";
        }
        // Email checks
        if (validator_1.default.isEmpty(data.email)) {
            errors.email = "Email field is required!";
        }
        else if (!validator_1.default.isEmail(data.email)) {
            errors.email = "That is not a valid email!";
        }
        if (validator_1.default.isEmpty(data.usernameOrEmail)) {
            errors.usernameOrEmail = "Username or email field is required!";
        }
        // Password checks
        if (validator_1.default.isEmpty(data.password)) {
            errors.password = "Password field is required!";
        }
        if (validator_1.default.isEmpty(data.password2)) {
            errors.password2 = "Confirm password field is required!";
        }
        if (!validator_1.default.isLength(data.password, { min: 6, max: 30 })) {
            errors.password = "Password must be at least 6 characters!";
        }
        if (!validator_1.default.equals(data.password, data.password2)) {
            errors.password2 = "Passwords must match!";
        }
        Object.entries(this.checks).forEach(([field, predicate]) => {
            let fieldInput = data[field];
            let fieldError = predicate(fieldInput, field);
            if (!is_empty_1.default(fieldError)) {
                errors[field] = fieldError;
            }
        });
        this.dontUse.forEach(key => {
            delete errors[key];
        });
        return {
            errors,
            isValid: is_empty_1.default(errors)
        };
    }
    addCheck(field, predicate) {
        // predicate returns error string
        this.checks[field] = predicate;
    }
}
;
exports.default = FormValidator;
//# sourceMappingURL=FormValidator.js.map