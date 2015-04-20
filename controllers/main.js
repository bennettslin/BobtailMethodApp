var db = require('../models');
var express = require('express');
var router = express.Router();
var async = require('async');

router.get("/", function(req, res) {
  res.render("main/index");
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