import Mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3
        },
        elo: {
            type: Number,
            required: true
        },
        joinDate: {
            type: Date,
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