var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

  // if composition is from code, add it
var renderCompositionsShow = function(composition, req, res) {
  var compositionObject = req.getCompositionFromCode(composition.melody);
  if (compositionObject) {
    compositionObject.composition = composition;
    res.render("compositions/show", compositionObject);
  } else {
    res.render("compositions/show", {composition: composition});
  }
}

  // add critic name, if found
var addCriticName = function(critique, callback) {
  db.user.find(critique.userId).then(function(user) {
    critique.criticName = user.firstname + " " + user.lastname;
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

  // get form to create new composition
router.get("/new", function(req, res) {
  res.render("compositions/new");
});

// FIXME: make this a global variable
var NODE_ENV = process.env.NODE_ENV || 'development';
var BASE_URL = (NODE_ENV === 'production') ? 'https://bobtail-method-app.herokuapp.com' : 'http://localhost:3000';

  // user posts composition data to send through email
router.post("/mail", function(req, res) {
  var melodyString = req.body["composition-string"];
  var email = req.body["composition-email"] || "";
  res.redirect("mailto:" + email + "?subject=Your%20Bobtail%20Method%20composition&body=%0D" + Array(56).join("_") + "%0D%0D" + BASE_URL + "/" + melodyString + "%0A" + Array(56).join("_"));
});

  // user posts composition data to save to database
router.post("/", function(req, res) {
  var loggedInUser = req.user;
  if (loggedInUser && req.body["button-status"] == "publish") {
    db.user.find(loggedInUser.id).then(function(user) {

      // user found
      db.composition.create({melody: req.body["composition-string"],
                             userId: user.id}).then(function(composition) {
        req.flash("success", "Composition saved!");
        res.redirect("users/compositions/" + user.id);
      });

    }).catch(function(error) {
      req.flash("danger", "You must save this composition under your own account.");
      res.redirect("/");
    });

    // new from copy
  } else {

    // fixme: not DRY; repeats renderCompositionsShow code
    var composition = {melody: req.body["composition-string"]};
    var compositionObject = req.getCompositionFromCode(composition.melody);
    if (compositionObject) {
      compositionObject.composition = composition;
      compositionObject.status = "copy";
      res.render("compositions/new", compositionObject);

      // this should never happen if input comes from grid interface
    } else {
      res.render("compositions/new", {status: "copy"});
    }
  }

});

  // get specific composition
  // FIXME: this should probably use include, rather than so many nested finds
router.get("/:id", function(req, res) {
  console.log("params is", req.params.id);
  db.composition.find(req.params.id).then(function(composition) {

    composition.abc = req.getAbcFromCode(composition.melody);

    db.critique.findAll({where: {compositionId: composition.id}}).then(function(critiques) {
      critiques = critiques || [];
      async.each(critiques, addCriticName, function(error) {
        if (!error) {
          composition.critiques = critiques;
          db.user.find(composition.userId).then(function(user) {
            composition.composerName = user.firstname + " " + user.lastname;
            db.provider.find({where: {userId: user.id}}).then(function(provider) {
              if (provider.type == 'facebook') {
                var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
                composition.picUrl = picUrl;
                renderCompositionsShow(composition, req, res);
              }

            }).catch(function(error) {
              renderCompositionsShow(composition, req, res);
            })
          })
        }
      });

    }).catch(function(error) {
      req.flash("danger", "This critique doesn't exist.");
      res.redirect("/");
    });
  }).catch(function(error) {
    req.flash("danger", "This composition doesn't exist.");
    res.redirect("/");
  });
});

  // user deletes composition
router.delete("/:id", function(req, res) {
  db.composition.destroy({where: {id:req.params.id}}).then(function() {
    res.send({result:true});
  }).catch(function(error) {
    res.redirect("/");
  });
})

module.exports = router;