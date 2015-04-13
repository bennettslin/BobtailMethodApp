var db = require('./models');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var app = express();
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// check for logged in user
app.use(function(req, res, next) {
  req.getUser = function() {
    return req.session.user || false;
  }
  next();
})

app.use(function(req, res, next) {
  res.locals.loggedInUser = req.getUser();
  next();
})

// flash messages
app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  next();
})

app.use('/', require('./controllers/main.js'));
app.use('/auth',require('./controllers/auth.js'));
app.use('/compositions', require('./controllers/compositions.js'));
app.use('/critiques', require('./controllers/critiques.js'));
app.use('/users', require('./controllers/users.js'));

app.get("/:invalid", function(req, res) {
  res.redirect("/");
});

var port = 3000;
app.listen(port, function() {
  console.log("Server is ready on port " + port + ".");
});