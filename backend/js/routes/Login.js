import { Router } from 'express';
import User from '../models/User.model.js';
import FormValidator from '../../../public/js/FormValidator.js';
import bcrypt from 'bcrypt';
import Validator from 'validator';
import jwt from 'jsonwebtoken';
import { config as dotconfig } from 'dotenv';
import { sendAuthToken } from '../JWTPassportUtils.js';

dotconfig();

const router = Router();
const loginValidator = new FormValidator(['username', 'email', 'password2']);

router.route('/').post((req, res) => {
    let response = loginValidator.validate(req.body);
    if (response.isValid) {
        let usernameOrEmail = req.body.usernameOrEmail;
        let plainTxtPwd = req.body.password;
        const onUserFound = (user) => {
            if (user) {
                let hash = user.get('password');
                bcrypt.compare(plainTxtPwd, hash).then(isMatch => {
                    if (isMatch) {
                        sendAuthToken(res, user, 'Logged in!');
                    } else {
                        res.status(400).json({
                            password: 'Incorrect password'
                        });
                    }
                }).catch(err => {
                    res.status(400).json(err);
                });
            } else {
                res.status(400).json({
                    usernameOrEmail: 'No account associated with that username or email'
                });
            }
        }
        if (Validator.isEmail(usernameOrEmail)) {
            User.findOne({ email: usernameOrEmail})
                .then(onUserFound);
        } else {
            User.findOne({ username: usernameOrEmail })
                .then(onUserFound);
        }
    } else {
        res.status(400).json(response.errors);
    }
});

export default router;