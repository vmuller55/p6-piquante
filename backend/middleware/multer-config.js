const multer = require('multer');
/**
 * Bibliothèque de format d'image possible
 */
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};
/**
 * Utilisation de la méthode diskStorage qui va définir le chemin d'accès de l'image ainsi que son nom
 */
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    /**
     * Construction du nom de fichier la méthode split et la méthode join va transformer les espace en underscore
     */
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype]; 
        /**
         * Rajout de la date dans le nom de l'image pour la rendre unique
         */
        callback(null, name + Date.now() + '.' + extension);
    }
});
/**
 * Utilisation de single pour préciser qu'il s'agit un fichier unique et non un ensemble
 */
module.exports = multer({storage: storage}).single('image');