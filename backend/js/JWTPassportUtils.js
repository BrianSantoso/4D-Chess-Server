import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from './models/User.model.js';
import jwt from 'jsonwebtoken';
import { config as dotconfig } from 'dotenv';
dotconfig();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};
const configurePassport = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findById(jwt_payload._id)
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
            .catch(err => console.log(err));
        })
    );
};

// Sign token and send
const sendPayload = (res, payload, successMessage) => {
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 31556926},
        (err, token) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.json({
                    message: successMessage,
                    token: token
                    // https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
                    // token: "Bearer " + token
                });
            }
        }
    );
};

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
}

export { configurePassport, sendPayload, sendAuthToken };