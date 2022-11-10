const Sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
  console.log(req);
    const sauce = new Sauce({      
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      mainPepper: req.body.mainPepper,
      heat: req.body.heat,
      userId: req.auth.userId
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