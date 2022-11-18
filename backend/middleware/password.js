/**
 * Importation du model Password
 */
const passwordSchema = require ('../models/Password');
/**
 * Utilisiation de la méthode validate de password-validator
 */
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    }
    else {
        /**
         * Le frontend actuel ne permet pas l'affichage de ce message actuellement
         */
        res.status(400).json({ message : 'Le mot de passe doit contenir au moins 8 caractères dont au moins une majuscule et une minuscule ainsi que deux chiffres'});
    }
}