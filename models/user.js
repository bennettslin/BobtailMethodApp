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
    avatar: {
      type: DataTypes.STRING,
      validate: {

      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: "Email address must be valid."
        }
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
      },
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: function(user, options, sendback) {
        bcrypt.hash(user.password, 10, function(error, hash) {
          if (error) {
            throw error;
          }
          user.password = hash;
          sendback(null, user);
        });
      }
    },
    classMethods: {
      associate: function(models) {
        models.user.hasMany(models.composition);
        models.user.hasMany(models.critique);
      }
    }
  });
  return user;
};