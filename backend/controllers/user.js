const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.signup = (req,res,next) => {
/**
 * hash le password 10 fois avec bcrypt // Fonction asynchrone qui renvoie une Promise avec le hash généré
 */
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        /**
         * Création de l'utilisateur puis enregistrement dans la base de donné avec user.save()
         */
        const user = new User({
            email: req.body.email,
            password: hash
        })
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
        .catch(error => res.status(400).json({error}));

    })
    .catch(error => res.status(500).json({error}));
};

exports.login = (req,res,next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        /**
         * Vérifie si l'utilisateur existe déjà dans la base de données
         */
        if (user === null) {
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
                         * Fonction de jsonwebtoken permettant de chiffrer le token
                         */
                        token: jwt.sign(
                            { userId: user._id},
                            'RANDOM_TOKEN_SECRET',/**Clé de chiffrement */
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