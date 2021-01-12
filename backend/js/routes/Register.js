import { Router } from 'express';
import User from '../models/User.model.js';
import FormValidator from '../../../public/js/FormValidator.js';
import bcrypt from 'bcrypt';
import { simpleErrors } from '../MongooseUtils.js';

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
            lastLogin: new Date()
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
                    .then(() => res.json('Account created!'))
                    .catch(err => res.status(400).json(simpleErrors(err)));
            }
        });
    } else {
        res.status(400).json(response.errors);
    }
});

export default router;