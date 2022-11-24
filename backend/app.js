/**
 * Importation de mongoose, express, helmet, dotenv et path / Attribution des routes dans des const
 */
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const rateLimit = require('express-rate-limit');
/**
 * Utilisation d'express via une variable
 */
const app = express();
/**
 * Permet d'exploiter le corps des requetes
 */
app.use(express.json());
/**
 * Connexion à la base de données // Utilisation de dotenv afin de rajouter une certaine sécurité sur le nom de la base de données et son accès
 */
 mongoose.connect("mongodb+srv://"+ process.env.DB_NAME + ":" + process.env.DB_PASSWORD + "@testcoursdev.yxlurlm.mongodb.net/?retryWrites=true&w=majority",
 { useNewUrlParser: true,
   useUnifiedTopology: true})
   .then(() => console.log('Connexion à MongoDB réussie !'))
   .catch(() => console.log('Connexion à MongoDB échouée'));
/**
 * Mise en place des headers d'autorisation
 */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
/**
 * Définition des routes à l'aide des variables
 */
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
/**
 * Utilisation de la fonction static inclus dans express pour pouvoir utiliser le répértoir images // Utilisation de path qui permet de manipuler les dossier et fichiers
 */
app.use('/images', express.static(path.join(__dirname, 'images')));
/**
 * Utilisation de Helmet afin de renforcer la sécurité de l'api // Spécifiquement sur les headers HTTP
 */
app.use(helmet({crossOriginResourcePolicy: false}));
/**
 * Utilisation de rateLimit afin de renforcer la sécurité ici chaque adresse ip sera limiter à 100 requêtes par tranche de 15 minutes
 */
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

module.exports = app;