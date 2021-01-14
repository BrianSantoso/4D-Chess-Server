import { Router } from 'express';
import User from '../models/User.model.js';
import FormValidator from '../../../public/js/FormValidator.js';
import bcrypt from 'bcrypt';
import { simpleErrors } from '../MongooseUtils.js';
import { sendAuthToken } from '../JWTPassportUtils.js';

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
                        sendAuthToken(res, user, 'Account created!');
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

const genGuestUsername = () => {
    let proposedName = uniqueNamesGenerator(randomNameConfig);
    return generateUniqueAccountName(proposedName);
}

// https://stackoverflow.com/a/46326576
const generateUniqueAccountName = (proposedName) => {
    return User
        .findOne({username: proposedName})
        .then(user => {
            if (user) {
                proposedName = genGuestUsername();
                return generateUniqueAccountName(proposedName);
            } else {
                return proposedName; // proposedName is unique
            }
        })
        .catch(err => {
            console.error('Attempted to generate unique guest username but failed unexpectedly', err);
        });
}

router.route('/guest').get((req, res) => {
    genGuestUsername().then(username => {
        console.log('Generated guest username:', username)
        let fields = {
            username: username, 
            email: `${username}@dummyusername.com`,
            password: process.env.GUEST_PWD,
            elo: 1000,
            joinDate: new Date(),
            lastLogin: new Date(),
            wins: 0,
            losses: 0,
            draws: 0,
            totalOpponentRatings: 0
        }
        const newUser = new User(fields);
        newUser.save()
            .then(user => {
                sendAuthToken(res, user, 'Guest Account created!');
            })
            .catch(err => {
                res.status(400).json(err)
                console.log(err)
            });
    });
});

export default router;