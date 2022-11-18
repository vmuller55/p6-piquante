/**
 * Récupération du model User, utilisation des modules bcrypt et jwt
 */
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
/**
 * Route POST qui permet d'enregister un utilisateur
 */
exports.signup = (req,res,next) => {
/**
 * Utilisation de bcrypt pour hacher le mot de passe, ce dernier est hashé 10 fois
 */
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        /**
         * Création de l'utilisateur en utilisant le modèle User mis en place dans /models/User
         */
        const user = new User({
            email: req.body.email,
            password: hash
        })
        /**
         * Enregistrement des données avec la méthode save
         */
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
        .catch(error => res.status(400).json({error}));

    })
    .catch(error => res.status(500).json({error}));
};
/**
 * Route POST qui permet de s'identifier
 */
exports.login = (req,res,next) => {
    /**
     * Utilisation de la méthode findOne afin de retouver l'utilisateur grace à son email
     */
    User.findOne({email: req.body.email})
    .then(user => {
        /**
         * Vérifie si l'utilisateur existe déjà dans la base de données
         */
        if (user === null) { 
            /**
             * Le message ne reflete pas l'absence de l'email dans la base de données pour des raisons de sécurité
             */
            res.status(401).json({message : "Paire identifiant/mot de passe incorrecte"});
        }
        /**
         * Si il existe, comparaison avec la méthode compare de bcrypt pour voir la correspondance avec le mdp
         */
        else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                /**
                 * Si le mdp ne correspond pas alors message d'erreur
                 */
                if (!valid) {
                    res.status(401).json({message : "Paire identifiant/mot de passe incorrecte"});
                }
                /**
                 * Si il correspond alors nous renvoyon l'id de l'user dans un token
                 */
                else {
                    res.status(200).json({
                        userId: user._id,
                        /**
                         * Utilisation de la méthode sign de jsonWebToken pour assigner un token à l'aide d'une clé de chiffrement et attribution d'un délai d'expiration de ce dernier
                         */
                        token: jwt.sign(
                            { userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    });
                }
            })
            .catch(error => res.status(500).json({error}));
        }
    })
    .catch(error => res.status(500).json({error}));
};