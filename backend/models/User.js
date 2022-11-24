const mongoose = require('mongoose');
/**
 * Utilisation de unique-validator pour gérer l'authentification unique par adresse mail
 */
const uniqueValidator = require('mongoose-unique-validator');
/**
 * Utilisation de mongoose-mongodb-errors pour faire remonter les erreurs de base de données 
 */
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);