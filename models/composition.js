"use strict";
var db = require('../models');

module.exports = function(sequelize, DataTypes) {
  var composition = sequelize.define("composition", {
    title: {
      type: DataTypes.STRING,
      validate: {

      },
    },
    melody: {
      type: DataTypes.STRING,
      validate: {

      },
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      validate: {

      },
      allowNull: false
    }
  }, {
    hooks: {
        // FIXME: This hook does not work
      beforeDestroy: function(composition, options, sendback) {
        db.critique.destroy({where: {compositionId: composition.id}}).then(function(critiques) {
          sendback(null, composition);
        }).catch(function(error) {
          sendback(null, composition);
        });
      }
    },
    classMethods: {
      associate: function(models) {
        models.composition.belongsTo(models.user);

        // FIXME: This cascade delete does not work
        models.composition.hasMany(models.critique, {onDelete: "cascade"});
      }
    }
  });
  return composition;
};