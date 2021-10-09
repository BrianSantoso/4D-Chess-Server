"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const User_model_js_1 = tslib_1.__importDefault(require("../models/User.model.js"));
const FormValidator_js_1 = tslib_1.__importDefault(require("../../../public/js/FormValidator.js"));
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const validator_1 = tslib_1.__importDefault(require("validator"));
const dotenv_1 = require("dotenv");
const JWTPassportUtils_js_1 = require("../JWTPassportUtils.js");
dotenv_1.config();
const router = express_1.Router();
const loginValidator = new FormValidator_js_1.default(['username', 'email', 'password2']);
router.route('/').post((req, res) => {
    let response = loginValidator.validate(req.body);
    if (response.isValid) {
        let usernameOrEmail = req.body.usernameOrEmail;
        let plainTxtPwd = req.body.password;
        const onUserFound = (user) => {
            if (user) {
                let hash = user.get('password');
                bcrypt_1.default.compare(plainTxtPwd, hash).then(isMatch => {
                    if (isMatch) {
                        JWTPassportUtils_js_1.sendAuthToken(res, user, `Logged in! You will be ${user.get('username')} with the next game you join.`);
                    }
                    else {
                        res.status(400).json({
                            password: 'Incorrect password'
                        });
                    }
                }).catch(err => {
                    res.status(400).json(err);
                });
            }
            else {
                res.status(400).json({
                    usernameOrEmail: 'No account associated with that username or email'
                });
            }
        };
        if (validator_1.default.isEmail(usernameOrEmail)) {
            User_model_js_1.default.findOne({ email: usernameOrEmail })
                .then(onUserFound);
        }
        else {
            User_model_js_1.default.findOne({ username: usernameOrEmail })
                .then(onUserFound);
        }
    }
    else {
        res.status(400).json(response.errors);
    }
});
exports.default = router;
//# sourceMappingURL=Login.js.map