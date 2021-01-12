// https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669
import Validator from 'validator';
import isEmpty from 'is-empty';

class FormValidator {
    constructor (dontUse=[]) {
        this.dontUse = dontUse;
        this.checks = {};
    }

    validate(data) {
        let errors = {};
        // Convert empty fields to an empty string so we can use validator functions
        data.username = !isEmpty(data.username) ? data.username : "";
        data.email = !isEmpty(data.email) ? data.email : "";
        data.usernameOrEmail = !isEmpty(data.usernameOrEmail) ? data.usernameOrEmail : "";
        data.password = !isEmpty(data.password) ? data.password : "";
        data.password2 = !isEmpty(data.password2) ? data.password2 : "";

        // username checks
        if (Validator.isEmpty(data.username)) {
            errors.username = "Username field is required";
        }
        // Email checks
        if (Validator.isEmpty(data.email)) {
            errors.email = "Email field is required";
        } else if (!Validator.isEmail(data.email)) {
            errors.email = "Email is invalid";
        }

        if (Validator.isEmpty(data.usernameOrEmail)) {
            errors.usernameOrEmail = "Username or email field is required";
        }

        // Password checks
        if (Validator.isEmpty(data.password)) {
            errors.password = "Password field is required";
        }
        if (Validator.isEmpty(data.password2)) {
            errors.password2 = "Confirm password field is required";
        }
        if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
            errors.password = "Password must be at least 6 characters";
        }
        if (!Validator.equals(data.password, data.password2)) {
            errors.password2 = "Passwords must match";
        }
        Object.entries(this.checks).forEach(([field, predicate]) => {
            let fieldInput = data[field];
            let fieldError = predicate(fieldInput, field);
            if (!isEmpty(fieldError)) {
                errors[field] = fieldError;
            }
        });
        this.dontUse.forEach(key => {
            delete errors[key];
        });
        return {
            errors,
            isValid: isEmpty(errors)
        };
    }

    addCheck(field, predicate) {
        // predicate returns error string
        this.checks[field] = predicate;
    }
};

export default FormValidator;