import { Router } from 'express';
import User from '../models/User.model.js';
import FormValidator from '../../../public/js/FormValidator.js';

const router = Router();
const registrationValidator = new FormValidator(['password2']);

router.route('/').post((req, res) => {
    console.log('request body:', req.body);
    let response = registrationValidator.validate(req.body);
    if (response.isValid) {
        // TODO: don't let user send elo, join date, etc!!!
        let fields = req.body;
        Object.assign(fields, {
            elo: 1000,
            lastLogin: new Date()
        });
        const newUser = new User(fields);
        newUser.save()
            .then(() => res.json('User added!'))
            .catch(err => res.status(400).json('Error: ' + err));
    } else {
        res.status(400).json('Error: ' + response.errors);
    }
    console.log(response)
});

export default router;