var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

var addComposerName = function(composition, callback) {
  db.user.find(composition.userId).then(function(user) {
    composition.composerName = user.name;
    callback();

  }).catch(function(error) {
    callback(error);
  });
}

var addCriticName = function(critique, callback) {
  db.user.find(critique.userId).then(function(user) {
    critique.criticName = user.name;
    callback();

  }).catch(function(error) {
    callback(error);
  });
}

router.get("/", function(req, res) {
  db.composition.findAll().then(function(compositions) {
    async.each(compositions, addComposerName, function(error) {
      if (!error) {
        res.render("compositions/index", {compositions: compositions});
      } else {
        // handle error
      }
    });
  });
});

router.get("/new", function(req, res) {
  res.render("compositions/new");
});

router.post("/mail", function(req, res) {
  var email = req.body.email;
  var body = req.body.body;
  res.redirect("mailto:" + email + "?subject=Your%20lovely%20melody&body=" + body);
});

router.post("/", function(req, res) {
  var loggedInUser = req.getUser();
  if (loggedInUser) {
    db.user.find(loggedInUser.id).then(function(user) {

      // user found
      db.composition.create({melody: req.body.melody,
                            harmony: req.body.harmony,
                             userId: user.id}).then(function(composition) {
        req.flash("success", "Composition saved!");
        res.redirect("users/compositions/" + user.id);
      });

    }).catch(function(error) {
      req.flash("danger", "You must save this composition under your own account.");
      res.redirect("/compositions");
    });

  } else {
    req.flash("danger", "You cannot save a composition without being logged in.");
    res.redirect("/compositions");
  }

});


router.get("/:id", function(req, res) {
  db.composition.find(req.params.id).then(function(composition) {
    db.critique.findAll({where: {compositionId: composition.id}}).then(function(critiques) {
      critiques = critiques || [];
      async.each(critiques, addCriticName, function(error) {
        if (!error) {
          composition.critiques = critiques;
          res.render("compositions/show", {composition: composition});
        }
      });
    })
  }).catch(function(error) {
    res.render("compositions/error");
  });
});

module.exports = router;