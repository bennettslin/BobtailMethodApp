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

module.exports = router;