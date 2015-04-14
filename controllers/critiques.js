var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

router.post("/", function(req, res) {
  if (req.user) {
    var comment = req.body.comment;
    db.composition.find(req.body.id).then(function(composition) {
      db.critique.create({comment: req.body.comment, compositionId: composition.id, userId: req.user.id}).then(function (critique) {
        res.redirect("/compositions/" + composition.id);
      });
    });
  } else {
    res.redirect("/compositions/" + composition.id);
  }
});

module.exports = router;