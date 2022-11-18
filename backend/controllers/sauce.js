const Sauce = require('../models/Sauce');
const fs = require('fs');

/**post qui utilise le modele Sauce et la méthode save pour rajouter un objet */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  /**
   * permet d'avoir une sécurité supplémentaire
   */
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      /**
       * réatribution de l'userId
       */
      userId: req.auth.userId,
      /**
       * création de l'url de l'image
       */
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
  .catch(error => { res.status(400).json( { error })});
};


/** get qui cherche une sauce spécifique avec findOne (utilise req.params pour accèder à la partie dynamique(:id)) en utilisant l'id (:id) */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({error}));
};
/**get qui utilises find sur le modèle Sauce afin de renvoyer les sauces enregistées dans la base de donné */
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}));
};

/**put pour modifier une sauce */
  exports.modifySauce = (req, res, next) => {
    /**
     * Permet de svoir qi la requete contient un fichier
     */
     const sauceObject = req.file? {
      /**
       * Transforme le paramètre en objet 
       */
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      /**
       * Vérification de la correspondance de l'id
       */
      if (sauce.userId != req.auth.userId ) {
        res.status(401).json({message: 'Non-autorisé'});
      }
      else {
        Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Sauce modifiée'}))
        .catch(error => {res.status(400).json({error})});
      }
    })
    .catch(error => { res.status(400).json( { error })})
  };
/**delete pour suppr */
  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      if(sauce.userId != req.auth.userId) {
        res.status(401).json({message: 'Non-autorisé'});
      }
      else {
        /**
         * Suppression de l'objet dans la base de donné mais également de l'image
         */
        const filename = sauce.imageUrl.split('/images/')[1];
        /**
         * utilisation de la fonction unlink pour supprimer l'image
         */
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({message:'Objet supprimé'}))
          .catch(error => res.status(401).json({error}));
        })
      }
    })
    .catch(error => { res.status(500).json( { error })});
  };

/**like or not */
exports.likeOrNot = (req, res, next) => {
    if (req.body.like === 1) {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
            .then((sauce) => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(400).json({ error }))
    } else if (req.body.like === -1) {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
            .then((sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(400).json({ error }))
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }))
    }
}
