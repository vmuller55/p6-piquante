/**
 * Récupération du model Sauce dans une const et utilisation de fs (file système qui est inclus dans Node)
 */

const Sauce = require('../models/Sauce');
const fs = require('fs');

/**
 * Route POST qui permet de créer un objet
 */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  /**
   * Sppression de l'id et de l'user id de l'objet afin d'éviter toute manipulation
   */
  delete sauceObject._id;
  delete sauceObject._userId;
  /**
   * Utilisation du modèle Sauce mis en place dans /models/Sauce.js
   */
  const sauce = new Sauce({
    /**
     * Syntaxe de décomposition pour placer plusieurs paires clés valeurs d'un coup, ici celle de la requète
     */
      ...sauceObject,
      /**
       * réatribution de l'userId en cécupérant celui de la requête
       */
      userId: req.auth.userId,
      /**
       * création de l'url de l'image
       */
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  /**
   * Utilisation de la méthode save 
   */
  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
  .catch(error => { res.status(400).json( { error })});
};


/**
 * Route GET qui permet, grace à la méthode findOne et à l'aide de l'id de la sauce, d'atteindre cette dernière 
 */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({error}));
};
/**
 * Route GET qui utilise la méthode find sur le model Sauce afin de récupérer tous les objets construit avec ce dernier
*/
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}));
};

/**
 * Route PUT qui va permettre de modifier une sauce
 */
  exports.modifySauce = (req, res, next) => {
    /**
     * req.file? nous permet de savoir si la requête contient un fichier
     */
     const sauceObject = req.file? {
      /**
       * Utilisation de JSON.parse sur la sauce appelé avec la requete 
       */
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      /**
       * Vérification de la correspondance de l'id du créateur et celui de la reqête
       */
      if (sauce.userId != req.auth.userId ) {
        res.status(401).json({message: 'Non-autorisé'});
      }
      else {
        /**
         * Utilisation de la méthode updateOne afin de modifier l'objet
         */
        Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Sauce modifiée'}))
        .catch(error => {res.status(400).json({error})});
      }
    })
    .catch(error => { res.status(400).json( { error })})
  };
/**
 * Route DELETE qui permet de supprimer une sauce
*/
  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      if(sauce.userId != req.auth.userId) {
        res.status(401).json({message: 'Non-autorisé'});
      }
      else {
        /**
         * Récupération de l'url de limage dans une const, utilisation de la méthode split avec /images/ pour argument afin de l'extraire
         */
        const filename = sauce.imageUrl.split('/images/')[1];
        /**
         * Utilisation de la fonction unlink pour supprimer l'image
         */
        fs.unlink(`images/${filename}`, () => {
          /**
           * Utilisation de la méthode deleteOne afin de supprimer la sauce
           */
          Sauce.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({message:'Objet supprimé'}))
          .catch(error => res.status(401).json({error}));
        })
      }
    })
    .catch(error => { res.status(500).json( { error })});
  };

/**
 * Route POST qui permet d'attribuer une valeur à "like"
*/
exports.likeOrNot = (req, res, next) => {
  /**
   * Si la requete contient 1 (like)
   */
    if (req.body.like === 1) {
      /**
       * Utilisation de updateOne / $inc recoit une valeur type NUMBER => ++ permet de l'incrémenté / $push renvoit la nouvelle valeur de l'array usersLike
       */
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
            .then(() => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(400).json({ error }))
            /**
             * Si la requete contient -1 (dislike)
             */
    } else if (req.body.like === -1) {
      /**
       * Idem mais la valeur de $inc est passé en négatif
       */
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
            .then(() => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(400).json({ error }))
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
              /**
               * Si le tableau des likes de la sauce contient l'id de l'utilisateur
               */
                if (sauce.usersLiked.includes(req.body.userId)) {
                  /**
                   * Permet de retirer 1 à la valeur de like et donc de la passer à 0
                   */
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then(() => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then(() => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }))
    }
}
