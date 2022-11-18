const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req,res, next) => {
    try {
    /**
     *Récupération du token en retirant la première partie (BEARER) dans le header en utilisant la méthode split 
     */
        const token = req.headers.authorization.split(' ')[1];
        /**
         * Méthode verify permet de decoder le token avec la clé 
         */
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = decodedToken.userId;
        
        req.auth = {
            userId : userId
        };
        next();
    } catch (error) {
        res.status(403).json({message:('403: unauthorized request.')});
    }
}