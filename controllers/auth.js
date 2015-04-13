var db = require('../models');
var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');

//display login form
router.get("/login", function(req,res) {
  res.render("auth/login");
});

//process login data and login user
router.post("/login", function(req, res) {

    //do login here (check password and set session value)
  db.user.find({where: {email: req.body.email}}).then(function(user) {
    if (user) {
      bcrypt.compare(req.body.password, user.password, function(error, result) {
        if (error) {
          throw error;
        }
        if (result) {

          // store user to session
          req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name
          }

          // password matched
          req.flash('success', 'Thanks for logging in, ' + user.name + '!');
          res.redirect("/users/" + user.id);

        } else {
          req.flash('danger', 'Oops. Invalid password.');
          res.redirect("/compositions");
        }
      });

    } else {
      req.flash('danger', 'Oops. Unknown user.');
      res.redirect("/compositions");
    }
  });
});

//display sign up form
router.get("/signup",function(req,res) {
  res.render("auth/signup");
});

//create new user in database
router.post("/signup",function(req,res) {

  var userQuery = {email: req.body.email};
  var userData = {email: req.body.email,
                  name: req.body.name,
                  password: req.body.password};

  // where finds, defaults creates
  db.user.findOrCreate({where: userQuery, defaults: userData}).spread(function(user, created) {

    if (created) {
      req.flash('Success', 'New user account created. Please log in!');
      res.redirect("/compositions");
    } else {
      req.flash('danger', 'That email address already exists!');
      res.redirect("/compositions");
    }
  }).catch(function(error) {

    //handle validation errors and create flash messages
    if (error) {
      if (Array.isArray(error.errors)) {
        error.errors.forEach(function(errorItem) {
          req.flash('danger', errorItem.message);
        });

      } else {
        req.flash('danger', 'Unknown error.');
      }

    } else {
      req.flash('danger', 'Unknown error.');
    }

    res.redirect("/compositions");
  })
})

//logout user
router.get("/logout",function(req,res){
  delete req.session.user;
  req.flash('info','You have been logged out.')
  res.redirect("/compositions");
});


module.exports = router;