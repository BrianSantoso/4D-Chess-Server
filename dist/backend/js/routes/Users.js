"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const User_model_js_1 = tslib_1.__importDefault(require("../models/User.model.js"));
const router = express_1.Router();
router.route('/').get((req, res) => {
    User_model_js_1.default.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json(err));
});
router.route('/:id').get((req, res) => {
    User_model_js_1.default.findById(req.params.id)
        .then(user => res.json(user))
        .catch(err => res.status(400).json(err));
});
// router.route('/:username').get((req, res) => {
//     User.findOne({username: req.params.username})
//       .then(users => res.json(users))
//       .catch(err => res.status(400).json('Error: ' + err));
// });
exports.default = router;
//# sourceMappingURL=Users.js.map