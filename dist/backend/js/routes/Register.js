"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const User_model_js_1 = tslib_1.__importDefault(require("../models/User.model.js"));
const FormValidator_js_1 = tslib_1.__importDefault(require("../../../public/js/FormValidator.js"));
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const MongooseUtils_js_1 = require("../MongooseUtils.js");
const JWTPassportUtils_js_1 = require("../JWTPassportUtils.js");
// https://www.npmjs.com/package/unique-names-generator
const unique_names_generator_1 = require("unique-names-generator");
const router = express_1.Router();
const registrationValidator = new FormValidator_js_1.default(['usernameOrEmail', 'password2']);
router.route('/').post((req, res) => {
    // Run through manual format validation first
    let response = registrationValidator.validate(req.body);
    // response.isValid
    if (response.isValid) {
        let fields = req.body;
        // Assign user default properties / Overwrite an attack
        Object.assign(fields, {
            registered: true,
            elo: 1000,
            joinDate: new Date(),
            lastLogin: new Date(),
            wins: 0,
            losses: 0,
            draws: 0,
            totalOpponentRatings: 0
        });
        // Hash password
        const saltRounds = 10;
        bcrypt_1.default.hash(fields.password, saltRounds, (err, hash) => {
            if (err) {
                res.json(error);
            }
            else {
                fields.password = hash;
                const newUser = new User_model_js_1.default(fields);
                newUser.save()
                    .then(user => {
                    JWTPassportUtils_js_1.sendAuthToken(res, user, `Account created! You will be ${user.get('username')} with the next game you join.`);
                })
                    .catch(err => res.status(400).json(MongooseUtils_js_1.simpleErrors(err)));
            }
        });
    }
    else {
        res.status(400).json(response.errors);
    }
});
const randomNameConfig = {
    dictionaries: [unique_names_generator_1.adjectives, unique_names_generator_1.animals],
    separator: '',
    length: 2 // num words
};
const createGuestUser = (res) => {
    let username = unique_names_generator_1.uniqueNamesGenerator(randomNameConfig);
    let fields = {
        username: username,
        registered: false,
        email: `${username}@${process.env.GUEST_EMAIL}`,
        password: process.env.GUEST_PWD,
        elo: 1000,
        joinDate: new Date(),
        lastLogin: new Date(),
        wins: 0,
        losses: 0,
        draws: 0,
        totalOpponentRatings: 0
    };
    let newUser = new User_model_js_1.default(fields);
    return newUser.save()
        .then(user => {
        // TODO: Rate limit. Don't allow repeated logout or authToken requests
        // to create infinite accounts
        JWTPassportUtils_js_1.sendAuthToken(res, user, 'Guest Account created!');
    })
        .catch(err => {
        // Generated username is invalid / already exists, so retry
        console.log(username, 'invalid, retrying random name generation');
        createGuestUser(res);
    });
};
router.route('/guest').get((req, res) => {
    createGuestUser(res);
});
exports.default = router;
//# sourceMappingURL=Register.js.map