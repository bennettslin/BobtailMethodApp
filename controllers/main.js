var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

  // add composer name and pic url, if found
var addComposerName = function(composition, callback) {
  db.user.find(composition.userId).then(function(user) {
    composition.composerName = user.firstname + " " + user.lastname;

      // user is on Facebook
    db.provider.find({where: {userId: user.id}}).then(function(provider) {
      if (provider.type == 'facebook') {
        var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
        composition.picUrl = picUrl;
      }
      callback();

      // user is not on Facebook
    }).catch(function(error) {
      callback();
    })

  }).catch(function(error) {
    callback(error);
  });
}

router.get("/", function(req, res) {
  db.composition.findAll().then(function(compositions) {
    async.each(compositions, addComposerName, function(error) {
      if (!error) {
        res.render("main/index", {compositions: compositions});
      } else {
        req.flash("danger", "Unable to find all composers.")
        res.redirect("/main/about");
      }
    });
  }).catch(function(error) {
    req.flash("danger", "Unable to find all compositions.");
    res.redirect("/main/about");
  });
  // res.render("main/index");
  // res.redirect("/compositions/index");
});

router.get("/about", function(req, res) {
  res.render("main/about");
});

router.get("/howto", function(req, res) {
  res.render("main/howto");
});

router.get("/error", function(req, res) {
  res.render("main/error");
});

module.exports = router;