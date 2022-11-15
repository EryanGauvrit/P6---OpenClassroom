const Sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
  console.log("req =>", req.body.sauce);
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
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
        error: error,
        message: 'Ne peut pas être enregistré dans la BD'          
      })
    }
  );
};

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
