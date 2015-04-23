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
  var instructionArray = [
    "Pick chords for the first two bars, along with a sensible key signature.",
    "Write a melody underneath those chords.",
    "Extend the melody into the third bar.",
    "Choose a chord for the third bar.",
    "Embellish and revise the melody.",
    "An easy way to start the melody is by arpeggiating chords, or by repeating and developing a motif. For example:",
    "...can then be embellished to become:",
    "An interesting melodic contour is aided by a variety of note durations, pitch intervals, and registers, as well as unique low and high points in the pitch range:",
    "Spice up harmonic progressions with modal mixture, in which a major chord is swapped with its minor equivalent, or vice versa:",
    "...or include augmented and diminished chords:",
    "Extended chords such as sevenths and ninths can be implied by strategically positioning nontriad tones in the melody.",
    "Compound melodies are single melodies that can be separated by the ear into two or more distinct lines occupying different registers:"
  ];

  var keyArray = ['F', 'F', 'A', 'Ab', 'Bb', 'G', 'F'];

  var rawAbcArray = [
    '"G" x3 x3 | "D" x3 x3 | x3 x3',
    '"G" G3 B2d | "D" d2A F2d | x3 x3',
    '"G" G3 B2d | "D" d2A F2d | c2A c3',
    '"G" G3 B2d | "D" d2A F2d | "A" c2A c3',
    '"G" G3 Bcd | "D" c2A Fed | "A" cEA B2c',
    '"Dm" Adf gec | "Gm" Adf gec | "Bb" Adf gec',
    '"Dm" e2f ecA | "Gm" B2f gec | "Bb" Adf gad',
    '"D" BcB F2A | "E" dGB edc | "A" B2c AGE',
    '"Fm" f2=e c2d | "Dbm" _edA _Fdc | "Cm" EBG E3',
    '"Bb" G2A B2c | "Fdim" d2c =Bef | "Eb" dGB cdc',
    '"G" gfe d2c | "E" Bcd =fed | "F" ecB A3',
    '"Dm" d2^c A2B | "Bbm" =cBF _DBA | "Am" CGE C3'
  ];

  var abcArray = [];

  for (var i = 0; i < rawAbcArray.length; i++) {
    if (i < 5) {
      abcArray.push('K:D\\n' + rawAbcArray[i] + '\\n');
    } else {
      abcArray.push('K:' + keyArray[i - 5] + '\\n' + rawAbcArray[i] + '\\n');
    }

  }

    // FIXME: eventually this will be the other way around; that is,
    // start with melody code, and then get abc from code

  var dataIdArray = [
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI",
    "DCADBEDYXWVUTSRPONMLKJIHI"
  ]

  res.render("main/howto", {instructionArray: instructionArray, abcArray: abcArray, dataIdArray: dataIdArray});
});

router.get("/error", function(req, res) {
  res.render("main/error");
});

module.exports = router;