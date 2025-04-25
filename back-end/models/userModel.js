// File: userModel.js

const mongoose = require('mongoose');

// Define the schema for user data
const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: {
        type: String,
        validate: {
            validator: function (value) {
                // Password must be at least 8 characters long
                // and contain at least one lowercase letter,
                // one uppercase letter, one digit, and one special character
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/.test(value);
            },
            message: props => `${props.value} is not a valid password. It must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.`
        }
    }
});


// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
