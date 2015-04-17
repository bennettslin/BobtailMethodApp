var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');

var getFacebookFriendUserId = function(friend, callback) {
  db.provider.find({where: {pid: friend.id}}).then(function(provider) {

    friend.id = provider.userId;
    var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
    friend.picUrl = picUrl;
    callback();
  }).catch(function(error) {
    callback(error);
  })
}

var getUserPicture = function(user, callback) {
  db.provider.find({where: {userId: user.id}}).then(function(provider) {
    if (provider.type == 'facebook') {
      var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
      user.picUrl = picUrl;
      callback();
    }
  }).catch(function(error) {
    callback(error);
  })
}

router.get("/", function(req, res) {
  var loggedInUser = req.user;
  if (typeof loggedInUser != "undefined" && loggedInUser.id == 1) {
    db.user.findAll().then(function(users) {
      async.each(users, getUserPicture, function(error) {
        res.render("users/index", {users: users});
      });
    });
  } else {
    res.redirect("/");
  }
});

router.get("/friends/:id", function(req, res) {
  db.user.find(req.params.id).then(function(user) {
    db.provider.find({where: {userId: user.id}}).then(function(provider) {
      if (provider.type == 'facebook') {
        var friendsUrl = "https://graph.facebook.com/" + provider.pid + "/friends" + "?access_token=" + provider.token;

        request(friendsUrl, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log("no error, friends array");
            var friendsArray = JSON.parse(body).data;
            async.each(friendsArray, getFacebookFriendUserId, function(error) {
              user.friends = friendsArray;
              res.render("users/friends", {user: user});
            });

          } else {
            console.log("error, no friends!");
            user.friends = [];
            res.render("users/friends", {user: user});
          }
        })
      }

    }).catch(function(error) {
      res.render("users/friends", {user: user});
    })
  });
});

router.get("/compositions/:id", function(req, res) {
  db.user.find(req.params.id).then(function(user) {
    db.composition.findAll({where: {userId: user.id}}).then(function(compositions) {
      compositions = compositions || [];
      user.compositions = compositions;
      db.provider.find({where: {userId: user.id}}).then(function(provider) {
        if (provider.type == 'facebook') {
          var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture";
          user.picUrl = picUrl;
          res.render("users/compositions", {user: user});
        }

      }).catch(function(error) {
        res.render("users/compositions", {user: user});
      })
    })
  }).catch(function(error) {
    req.flash("danger", "This user doesn't exist.");
    res.redirect("/");
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
    req.flash("danger", "This user doesn't exist.");
    res.redirect("/");
  });
});

module.exports = router;