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
            minlength: 3,
            maxLength: 15
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
        }
    }, {
        timestamps: true,
});

userSchema.plugin(uniqueValidator, {
    message: 'The {PATH} {VALUE} is already in use!',
});

const User = Mongoose.model('User', userSchema);

export default User;