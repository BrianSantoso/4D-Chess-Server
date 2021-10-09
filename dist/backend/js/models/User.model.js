"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const mongoose_unique_validator_1 = tslib_1.__importDefault(require("mongoose-unique-validator"));
const validator_1 = tslib_1.__importDefault(require("validator"));
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters!'],
        maxLength: [15, 'Username cannot be longer than 15 characters!'],
        validate: {
            validator: validator_1.default.isAlphanumeric,
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
            validator: validator_1.default.isEmail,
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
userSchema.plugin(mongoose_unique_validator_1.default, {
    message: 'The {PATH} {VALUE} is already in use!',
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.model.js.map