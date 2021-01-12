import { Router } from 'express';
import User from '../models/User.model.js';

const router = Router();

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json(err));
});

router.route('/:id').get((req, res) => {
    User.findById(req.params.id)
      .then(user => res.json(user))
      .catch(err => res.status(400).json(err));
});

// router.route('/:username').get((req, res) => {
//     User.findOne({username: req.params.username})
//       .then(users => res.json(users))
//       .catch(err => res.status(400).json('Error: ' + err));
// });




export default router;