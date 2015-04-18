var db = require('../models');
var express = require('express');
var router = express.Router();
var passport = require('passport');

var bcrypt = require('bcrypt');

//display login form
router.get("/login", function(req,res) {
  res.render("auth/login");
});

router.post("/login", function(req, res) {
  passport.authenticate('local', {badRequestMessage: "You must enter email and password."}, function(error, user, info) {

    if (user) {
      req.login(user, function(error) {
        if (error) throw error;
        req.flash('success', "You are now logged in.");
        res.redirect('/');
      })

    } else {
      var errorMsg = info && info.message ? info.message : "Unknown error.";
      req.flash('danger', errorMsg);
      res.redirect('/');
    }
  })(req, res);
});

//display sign up form
router.get("/signup",function(req,res) {
  res.render("auth/signup");
});

// //create new user in database
router.post("/signup",function(req,res) {

  var userQuery = {email: req.body.email};
  var userData = {email: req.body.email,
                  name: req.body.name,
                  password: req.body.password};

  // where finds, defaults creates
  db.user.findOrCreate({where: userQuery, defaults: userData}).spread(function(user, created) {

    if (created) {
      req.flash('success', 'New user account created. Please log in!');
      res.redirect("/");
    } else {
      req.flash('danger', 'That email address already exists!');
      res.redirect("/");
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

    res.redirect("/");
  })
})

router.get("/logout", function(req, res) {
  req.logout();
  req.flash('info', "You have been logged out.");
  res.redirect('/');
});

var ALLOWED_PROVIDERS = ['facebook'];

// oAuth login route
router.get("/login/:provider", function(req, res) {
  if (ALLOWED_PROVIDERS.indexOf(req.params.provider) == -1) {
    return res.send('invalid provider url.');
  }

  passport.authenticate(
    req.params.provider,
    {scope:['public_profile', 'email', 'user_friends']}
    )(req, res);
});

// oAuth callback route
router.get("/callback/:provider", function(req, res) {
  if (ALLOWED_PROVIDERS.indexOf(req.params.provider) == -1) {
    return res.send('invalid provider url.');
  }

  passport.authenticate(req.params.provider, function(error, user, info) {

    if (user) {
      req.login(user, function(error) {
        if (error) throw error;
        req.flash('success', "You are now logged in.");
        res.redirect('/');
      })

    } else {
      var errorMsg = info && info.message ? info.message : "Unknown error.";
      req.flash('danger', errorMsg);
      res.redirect('/');
    }
  })(req, res);
});

module.exports = router;