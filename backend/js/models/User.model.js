import Mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import Validator from 'validator';

const userSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true, // both unique, uniqueCaseInsensitive are required
            uniqueCaseInsensitive: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters!'],
            maxLength: [15, 'Username cannot be longer than 15 characters!'],
            validate: {
                validator: Validator.isAlphanumeric,
                message: props => 'Username can only have Alphanumeric characters!'
            }
        },
        registered: {
            type: Boolean,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            uniqueCaseInsensitive: true,
            trim: true,
            validate: {
                validator: Validator.isEmail,
                message: props => `${props.value} is not a valid email!`
            },
        },
        password: {
            type: String,
            required: true
        },
        elo: {
            type: Number,
            required: true
        },
        joinDate: {
            type: Date,
            requiredPaths: true
        },
        lastLogin: {
            type: Date,
            requiredPaths: true
        },
        wins: {
            type: Number,
            required: true,
            min: 0
        },
        losses: {
            type: Number,
            required: true,
            min: 0
        },
        draws: {
            type: Number,
            required: true,
            min: 0
        },
        totalOpponentRatings: {
            type: Number,
            required: true,
            min: 0
        }
    }, {
        timestamps: true,
});

userSchema.plugin(uniqueValidator, {
    message: 'The {PATH} {VALUE} is already in use!',
});

const User = Mongoose.model('User', userSchema);

export default User;