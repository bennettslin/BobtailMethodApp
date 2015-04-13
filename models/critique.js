"use strict";
module.exports = function(sequelize, DataTypes) {
  var critique = sequelize.define("critique", {
    comment: {
      type: DataTypes.TEXT,
      validate: {

      },
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      validate: {

      },
      allowNull: false
    },
    compositionId: {
      type: DataTypes.INTEGER,
      validate: {

      },
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.critique.belongsTo(models.user);
        models.critique.belongsTo(models.composition);
      }
    }
  });
  return critique;
};