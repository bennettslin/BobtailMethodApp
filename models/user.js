"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1,32],
          msg: "Name must be between 1 and 32 characters."
        }
      },
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      },
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [6, 24],
          msg: "Your password must be between 6 and 24 characters."
        }
      }
    }
  }, {
    hooks: {
      beforeCreate: function(user, options, sendback) {

          // if there is a password, as usual
        if (user.password) {
          bcrypt.hash(user.password, 10, function(error, hash) {
            if (error) throw error;
            user.password = hash;
            sendback(null, user);
          });

          // with OAuth, you don't necessarily need a password
        } else {
          sendback(null, user);
        }
      }
    },
    classMethods: {
      associate: function(models) {
        models.user.hasMany(models.composition);
        models.user.hasMany(models.critique);
        models.user.hasMany(models.provider);
      }
    },
    instanceMethods: {
      checkPassword: function(pass, callback) {
        if (pass && this.password) {
          bcrypt.compare(pass, this.password, callback);

          // no password, or else password didn't pass
        } else {
          callback(null, false);
        }
      }
    }

  });
  return user;
};