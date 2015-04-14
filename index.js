var db = require('./models');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var NODE_ENV = process.env.NODE_ENV || 'development';
var BASE_URL = (NODE_ENV === 'production') ? 'https://bobtail-method-app.herokuapp.com/' : 'http://localhost:3000';

// set up passport user serialization
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.user.find(id).then(function(user) {
    done(null, user.get());
  }).catch(done);
});

passport.use(new FacebookStrategy({

  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: BASE_URL + '/auth/callback/facebook'

}, function(accessToken, refreshToken, profile, done) {

  db.provider.find({
    where: {
      pid: profile.id,
      type: profile.provider
    },
      // eager loading does automatic joins
    include: [db.user]
  }).then(function(provider) {

    if (provider && provider.user) {
      // log in
      provider.token = accessToken;
      provider.save().then(function() {
        done(null, provider.user.get());
      })

    } else {
      // sign up
      var email = profile.emails[0].value;
      db.user.findOrCreate({
        where: {email: email},
        defaults: {email: email, name: profile.displayName, avatar: profile.profileUrl}
      }).spread(function(user, created) {
        if (created) {
          // user was created
          user.createProvider({
            pid: profile.id,
            token: accessToken,
            type: profile.provider
          }).then(function() {
            done(null, user.get());
          });

        } else {
          // signup failed
          done(null, false, {message: 'You already signed up with this email address. Please log in.'});

        }
      });
    }
  });
}));

passport.use(new LocalStrategy({
  usernameField: "email"
}, function(email, password, done) {
  db.user.find({where: {email: email}}).then(function(user) {
    if (user) {
      user.checkPassword(password, function(error, result) {
        if (error) return done(error);
        if (result) {
          done(null, user.get());
        } else {
          done(null, false, {message: "Invalid password."});
        }
      });
    } else {
      done(null, false, {message: "Unknown user. Please sign up."});
    }
  });
}));

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
app.use(passport.initialize());
app.use(passport.session());

// check for logged in user
app.use(function(req, res, next) {
  req.getUser = function() {
    return req.session.user || false;
  }
  next();
})

app.use(function(req, res, next) {
  res.locals.loggedInUser = req.user;
  next();
})

// for Facebook
app.use(function(req, res, next) {
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
})

// flash messages
app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  next();
})

app.use('/', require('./controllers/main.js'));
app.use('/compositions', require('./controllers/compositions.js'));
app.use('/auth',require('./controllers/auth.js'));
app.use('/critiques', require('./controllers/critiques.js'));
app.use('/users', require('./controllers/users.js'));

app.get("/:invalid", function(req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000);