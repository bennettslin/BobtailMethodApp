var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

router.get("/", function(req, res) {
  res.render("main/index");
  // res.redirect("/compositions");
});

router.get("/about", function(req, res) {
  res.render("main/about");
});

router.get("/:code", function(req, res) {
  var code = req.params.code.toUpperCase();
  var pitches = [];
  if (code.length < 18) {
    res.redirect("/");
  } else {
    var codeIsLegitimate = true;
    for (var i = 0; i < 18; i++) {
      if (code[i] == '-') {
        pitches.push(code[i]);
      } else {
        var pitch = code.charCodeAt(i) - 65;
        if (!isNaN(pitch) && pitch >= 0 && pitch <= 24) {
          pitches.push(pitch);
        } else {
          codeIsLegitimate = false;
        }
      }
    }

    if (codeIsLegitimate) {
      res.render("compositions/code", {activePitches: pitches});
    } else {
      res.redirect("/");
    }
  }
});

module.exports = router;