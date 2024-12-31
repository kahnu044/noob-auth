const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    clientApps: [{
        clientUrl: {
            type: String,
            required: true
        },
        authType: {
            type: String,
            enum: ['google', 'password'],
            required: true
        },
        password: {
            type: String,
            required: function () {
                return this.authType === 'password';
            }
        }
    }],
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords for a specific client app
userSchema.methods.comparePassword = async function(password, clientUrl) {
    const clientApp = this.clientApps.find(app => app.clientUrl === clientUrl);
    if (!clientApp) return false;

    return bcrypt.compare(password, clientApp.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
