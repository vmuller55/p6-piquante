const mongoose = require('mongoose');
/**
 * Utilisation de unique-validator pour gérer l'authentification unique par adresse mail
 */
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);