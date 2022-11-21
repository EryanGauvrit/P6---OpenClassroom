const Sauce = require('../models/sauce');
const fs = require('fs');

// Enregistrer les donées sur dans la BD et l'image dans son dossier
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [''],
    usersDisliked: ['']
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Sauce saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error        
      })
    }
  );
};

// Ressortir les différentes sauces de la BD et du dossier images
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => {
      if(!sauces){
          return res.status(404).json({error : "No results found"});
      };
      res.status(200).json(sauces);
  })
  .catch(error => {
      res.status(500).json({error});
  });
};

// Ressortir les détails d'une sauce de la BD et l'image du dossier
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Modification d'une sauce sur la base de donné si bon utilisateur
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : {...req.body};

  delete sauceObject._id;
  Sauce.findOne({_id: req.params.id})
      .then ((sauce) => {
        if (sauce.userId != req.auth.userId){
          res.status(401).json({message : 'Not authorized'});
        } else {
          Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
              .catch(error => res.status(401).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
};

// Suppression d'une sauce de la BD et du dossier images si bon utilisateur
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then ((sauce) => {
        if (sauce.userId != req.auth.userId){
          res.status(401).json({message : 'Not authorized'});
        } else {
          const filename = sauce.imageUrl.split('/images')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
                .then (() => { res.status(200).json({message: 'Sauce suprimée !'})})
                .catch(error => res.status(401).json({error}));
          })
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
};

// Gestion des likes / dislikes

exports.likeDislikeSauce = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;
  let sauceId = req.params.id;
  
  switch (like) {
    case 1 :
        Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: +1 }})
          .then(() => res.status(200).json({ message: "+1 Like" }))
          .catch((error) => res.status(400).json({ error }))
            
      break;

    case 0 :
        Sauce.findOne({ _id: sauceId })
           .then((sauce) => {
            if (sauce.usersLiked.includes(userId)) { 
              Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 }})
                .then(() => res.status(200).json({ message: "-1 Like" }))
                .catch((error) => res.status(400).json({ error }))
            }
            if (sauce.usersDisliked.includes(userId)) { 
              Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 }})
                .then(() => res.status(200).json({ message: "-1 Dislike" }))
                .catch((error) => res.status(400).json({ error }))
            }
          })
          .catch((error) => res.status(404).json({ error }))
      break;

    case -1 :
        Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 }})
          .then(() => { res.status(200).json({ message: "+1 Dislike" }) })
          .catch((error) => res.status(400).json({ error }))
      break;
      
      default:
        console.log(error);
  };
};