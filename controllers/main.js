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
  var keys = [];
  var chords = [];
  var pitches = [];
  if (code.length < 24) {
    res.redirect("/");
  } else {

    // FIXME: refactor when time permits
    var codeIsLegitimate = true;
    for (var i = 0; i < 6; i++) {

      // it's a key
      if (i % 2 == 0) {
        var key = code.charCodeAt(i) - 65;
        if (!isNaN(key) && key >= 0 && key < 12) {
          keys.push(key);
        } else {
          codeIsLegitimate = false;
        }

        // it's a chord
      } else {
        var chord = code.charCodeAt(i) - 65;
        if (!isNaN(chord) && chord >= 0 && chord < 4) {
          chords.push(chord);
        } else {
          codeIsLegitimate = false;
        }
      }
    }

    for (var i = 6; i < 24; i++) {

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
      res.render("compositions/code", {activePitches: pitches, keys: keys, activeChords: chords});
    } else {
      res.redirect("/");
    }
  }
});

module.exports = router;