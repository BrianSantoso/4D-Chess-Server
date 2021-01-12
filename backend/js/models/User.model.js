import Mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxLength: 15
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            maxLength: 64
        },
        elo: {
            type: Number,
            required: true
        },
        lastLogin: {
            type: Date,
            requiredPaths: true
        }
    }, {
        timestamps: true,
});

const User = Mongoose.model('User', userSchema);

export default User;