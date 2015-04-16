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

router.get("/code/:code", function(req, res) {
  var code = req.params.code;
  var compositionObject = req.getCompositionFromCode(code);
  if (compositionObject == false) {
    res.redirect("/");
  } else {
    res.render("compositions/code", compositionObject);
  }
});

module.exports = router;