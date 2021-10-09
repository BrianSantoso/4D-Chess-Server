"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const passport_jwt_1 = require("passport-jwt");
const User_model_js_1 = tslib_1.__importDefault(require("./models/User.model.js"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};
const configurePassport = passport => {
    passport.use(new passport_jwt_1.Strategy(opts, (jwt_payload, done) => {
        User_model_js_1.default.findById(jwt_payload._id)
            .then(user => {
            if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        })
            .catch(err => console.log(err));
    }));
};
exports.configurePassport = configurePassport;
// Sign token and send
const sendPayload = (res, payload, successMessage) => {
    jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: 31556926 }, (err, token) => {
        if (err) {
            res.status(400).json(err);
        }
        else {
            res.json({
                message: successMessage,
                token: token
                // https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
                // token: "Bearer " + token
            });
        }
    });
};
exports.sendPayload = sendPayload;
// No promises :( *sad noises*
// jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 31556926})
//     .then(token => {
//         res.json({
//             message: 'Logged in!',
//             token: "Bearer " + token
//         });
//     })
//     .catch(err => {
//         res.status(400).json(err);
//         console.log(err);
//     });
const sendAuthToken = (res, user, successMessage) => {
    const payload = {
        _id: user.get('_id'),
        username: user.get('username'),
        registered: user.get('registered')
        // elo: user.get('elo')
    };
    // Sign token and send
    sendPayload(res, payload, successMessage);
};
exports.sendAuthToken = sendAuthToken;
//# sourceMappingURL=JWTPassportUtils.js.map