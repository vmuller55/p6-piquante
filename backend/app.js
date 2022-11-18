/**
 * Importation de mongoose, express et path / Attribution des routes dans des const
 */
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
/**
 * Utilisation d'express via une variable
 */
const app = express();
/**
 * Permet d'exploiter le corps des requetes
 */
app.use(express.json());
/**
 * Connexion à la base de données 
 */
 mongoose.connect('mongodb+srv://Vincent:Test123@testcoursdev.yxlurlm.mongodb.net/?retryWrites=true&w=majority',
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
 * Utilisation de la fonction static inclus dans express pour pouvoir utiliser le répértoir imagges
 */
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;