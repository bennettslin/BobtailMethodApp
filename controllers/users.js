var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');

router.get("/", function(req, res) {
  db.user.findAll().then(function(users) {
    res.render("users/index", {users: users});
  });
});

router.get("/compositions/:id", function(req, res) {
  db.user.find(req.params.id).then(function(user) {
    db.composition.findAll({where: {userId: user.id}}).then(function(compositions) {
      compositions = compositions || [];
      user.compositions = compositions;
      res.render("users/compositions", {user: user});
    })
  });
});

router.get("/:id", function(req, res) {
  db.user.find(req.params.id).then(function(user) {
    db.composition.findAll({where: {userId: user.id}}).then(function(compositions) {
      compositions = compositions || [];
      user.compositions = compositions;

      db.provider.find({where: {userId: user.id}}).then(function(provider) {
        if (provider.type == 'facebook') {
          var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture?type=large";
          user.picUrl = picUrl;
          var friendsUrl = "https://graph.facebook.com/" + provider.pid + "/friends" + "?access_token=" + provider.token;
          console.log("friends url is ", friendsUrl);

          request(friendsUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log("body");
            } else {
              console.log("error", error, "response", response);
            }
            user.friends = body;
            res.render("users/show", {user: user});
          })
        }

      }).catch(function(error) {
        res.render("users/show", {user: user});
      })
    });
  }).catch(function(error) {
    res.render("users/error");
  });
});

module.exports = router;