var db = require('./models');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var NODE_ENV = process.env.NODE_ENV || 'development';
var BASE_URL = (NODE_ENV === 'production') ? 'https://bobtail-method-app.herokuapp.com' : 'http://localhost:3000';

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
        defaults: {email: email, firstname: profile.first_name, lastname: profile.last_name}
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


app.use(function(req, res, next) {
  req.getCompositionFromCode = function(code) {
    code = code.toUpperCase();
    var keys = [];
    var chords = [];
    var pitches = [];
    var signature;

      // string literal fails if less than 24 characters
    if (code.length < 25) {
      return false;
    } else {

      // first character is key signature
      var codedSign = code.charCodeAt(0) - 65;
      if (!isNaN(codedSign) && codedSign >= 0 && codedSign < 12) {
        signature = codedSign;
      } else {
        return false;
      }

        // next 6 characters are chord roots and types
      for (var i = 1; i < 7; i++) {

          // this is a chord root
        if (i % 2 == 1) {
          if (code[i] == '+') {
            keys.push(code[i]);
          } else {
            var key = code.charCodeAt(i) - 65;
            if (!isNaN(key) && key >= 0 && key < 12) {
              keys.push(key);
            } else {
              return false;
            }
          }

          // this is a chord type
        } else {
          if (code[i] == '+') {
            chords.push(code[i]);
          } else {
            var chord = code.charCodeAt(i) - 65;
            if (!isNaN(chord) && chord >= 0 && chord < 4) {
              chords.push(chord);
            } else {
              return false;
            }
          }
        }
      }

        // next 18 characters are notes in the melody
      for (var i = 7; i < 25; i++) {
        if (code[i] == '-') {
          pitches.push(code[i]);
        } else {
          var pitch = code.charCodeAt(i) - 65;
          if (!isNaN(pitch) && pitch >= 0 && pitch <= 24) {
            pitches.push(pitch);
          } else {
            return false;
          }
        }
      }
      return {activePitches: pitches, keys: keys, activeChords: chords, signature: signature};
    }
  };
  next();
})

app.use(function(req, res, next) {
  req.getAbcFromCode = function(code) {

      // get object with pitches (activePitches), chord roots (keys), chord types (chords), and key signature(signature)
    var composition = req.getCompositionFromCode(code);
    if (!composition) {
      return 'K:C\\n x3 x3 | x3 x3 | x3 x3';
    }

    var signatures = ["D\u266D", "A\u266D", "E\u266D", "B\u266D", "F", "C", "G", "D", "A", "E", "B", "G\u266D"];

    var chordRoots = ["A", "A\u266F/B\u266D", "B", "C", "C\u266F/D\u266D", "D", "D\u266F/E\u266D", "E", "F", "F\u266F/G\u266D", "G", "G\u266F/A\u266D"];

      // FIXME: change "-" and "+" to -1
      // FIXME: chord roots are offset
      // add chord types
      // consider accidentals based on keys
      // consider note durations

    var letterPitches = ["x", "A,", "_B,", "B,", "C", "_D", "D", "_E", "E", "F", "_G", "G", "_A", "A", "_B", "B", "c", "_d", "d", "_e", "e", "f", "_g", "g", "_a", "a" ];

    var keys = [];
    for (var i = 0; i < 3; i++) {
      keys.push(chordRoots[composition.keys[i]]);
    }

    var notes = [];
    for (var i = 0; i < 6; i++) {
      notes.push(letterPitches[composition.activePitches[i * 3] + 1] + letterPitches[composition.activePitches[i * 3 + 1] + 1] + letterPitches[composition.activePitches[i * 3 + 2] + 1]);
    }

    var signature = signatures[composition.signature];
    return 'K:' + signature + 'enter"' + keys[0] + '" ' + notes[0] + ' ' + notes[1] + ' | "' + keys[1] + '" ' + notes[2] + ' ' + notes[3] + ' | "' + keys[2] + '" ' + notes[4] + ' ' + notes[5];
  }
  next();
})

// check for logged in user
app.use(function(req, res, next) {
  req.getUser = function() {
    return req.session.user || false;
  }
  next();
})

app.use(function(req, res, next) {
  if (req.user && !req.user.picUrl) {
    db.provider.find({where: {userId: req.user.id}}).then(function(provider) {
      if (provider.type == 'facebook') {
        var picUrl = "http://graph.facebook.com/" + provider.pid + "/picture?type=large";
        req.user.picUrl = picUrl;
        res.locals.loggedInUser = req.user;
        next();
      }
    }).catch(function(error) {
      res.locals.loggedInUser = req.user;
      next();
    });
  } else {
    res.locals.loggedInUser = req.user;
    next();
  }
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

app.use('/compositions', require('./controllers/compositions.js'));
app.use('/auth',require('./controllers/auth.js'));
app.use('/critiques', require('./controllers/critiques.js'));
app.use('/users', require('./controllers/users.js'));
app.use('/', require('./controllers/main.js'));

app.get("/:code", function(req, res) {
  var stringCode = req.params.code;
  var compositionObject = req.getCompositionFromCode(stringCode);
  if (compositionObject == false) {
    req.flash("danger", "This is not a valid composition!");
    res.redirect("/");
  } else {
    res.render("compositions/code", compositionObject);
  }
});

app.listen(process.env.PORT || 3000);