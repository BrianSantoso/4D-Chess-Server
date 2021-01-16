import { Router } from 'express';
import User from '../models/User.model.js';
import FormValidator from '../../../public/js/FormValidator.js';
import bcrypt from 'bcrypt';
import { simpleErrors } from '../MongooseUtils.js';
import { sendAuthToken } from '../JWTPassportUtils.js';
import Validator from 'validator';

// https://www.npmjs.com/package/unique-names-generator
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const router = Router();
const registrationValidator = new FormValidator(['usernameOrEmail', 'password2']);

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
        bcrypt.hash(fields.password, saltRounds, (err, hash) => {
            if (err) {
                res.json(error);
            } else {
                fields.password = hash;
                const newUser = new User(fields);
                newUser.save()
                    .then(user => {
                        sendAuthToken(res, user, `Account created! You will be ${user.get('username')} with the next game you join.`);
                    })
                    .catch(err => res.status(400).json(simpleErrors(err)));
            }
        });
    } else {
        res.status(400).json(response.errors);
    }
});

const randomNameConfig = {
    dictionaries: [adjectives, animals], // colors can be omitted here as not used
    separator: '',
    length: 2 // num words
}

const createGuestUser = (res) => {
    let username = uniqueNamesGenerator(randomNameConfig);
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
    }
    let newUser = new User(fields);
    return newUser.save()
        .then(user => {
            sendAuthToken(res, user, 'Guest Account created!');
        })
        .catch(err => {
            // Generated username is invalid / already exists, so retry
            console.log(username, 'invalid, retrying random name generation')
            createGuestUser(res);
        });
}

router.route('/guest').get((req, res) => {
    createGuestUser(res);
});

export default router;