var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

var addComposerName = function(composition, callback) {
  db.user.find(composition.userId).then(function(user) {
    composition.composerName = user.name;
    db.provider.find({where: {userId: user.id}}).then(function(provider) {
      if (provider.type == 'facebook') {
        var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
        composition.picUrl = picUrl;
        callback();
      }
    }).catch(function(error) {
      callback(error);
    })

  }).catch(function(error) {
    callback(error);
  });
}

var addCriticName = function(critique, callback) {
  db.user.find(critique.userId).then(function(user) {
    critique.criticName = user.name;
    db.provider.find({where: {userId: user.id}}).then(function(provider) {
      if (provider.type == 'facebook') {
        var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
        critique.picUrl = picUrl;
        callback();
      }
    }).catch(function(error) {
      callback(error);
    })

  }).catch(function(error) {
    callback(error);
  });
}

router.get("/", function(req, res) {
  var loggedInUser = req.user;
  if (typeof loggedInUser != "undefined" && loggedInUser.id == 1) {
    db.composition.findAll().then(function(compositions) {
      async.each(compositions, addComposerName, function(error) {
        if (!error) {
          res.render("compositions/index", {compositions: compositions});
        } else {
          // handle error
        }
      });
    });
  } else {
    res.redirect("/");
  }
});

router.get("/new", function(req, res) {
  var pitches = ["G", "G\u266F/A\u266D", "A", "A\u266F/B\u266D", "B", "C", "C\u266F/D\u266D", "D", "D\u266F/E\u266D", "E", "F", "F\u266F/G\u266D"];
  res.render("compositions/new", {pitches: pitches});
});

router.post("/mail", function(req, res) {
  var melodyString = req.body["melody-string"];
  var email = req.body["melody-email"] || "";
  res.redirect("mailto:" + email + "?subject=Your%20Bobtail%20Method%20composition&body=" + melodyString);
});

router.post("/", function(req, res) {
  var loggedInUser = req.user;
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
      res.redirect("/");
    });

  } else {
    req.flash("danger", "You cannot save a composition without being logged in.");
    res.redirect("/");
  }

});

router.get("/:id", function(req, res) {
  db.composition.find(req.params.id).then(function(composition) {
    db.critique.findAll({where: {compositionId: composition.id}}).then(function(critiques) {
      critiques = critiques || [];
      async.each(critiques, addCriticName, function(error) {
        if (!error) {
          composition.critiques = critiques;
          db.user.find(composition.userId).then(function(user) {
            composition.composerName = user.name;
            db.provider.find({where: {userId: user.id}}).then(function(provider) {
              if (provider.type == 'facebook') {
                var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
                composition.picUrl = picUrl;
                res.render("compositions/show", {composition: composition});
              }

            }).catch(function(error) {
              res.render("compositions/show", {composition: composition});
            })
          })
        }
      });

    }).catch(function(error) {
      res.render("compositions/error");
    });
  }).catch(function(error) {
    res.render("compositions/error");
  });
});

module.exports = router;