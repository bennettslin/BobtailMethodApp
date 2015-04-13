"use strict";
module.exports = function(sequelize, DataTypes) {
  var composition = sequelize.define("composition", {
    melody: {
      type: DataTypes.STRING,
      validate: {

      },
      allowNull: false
    },
    harmony: {
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
    classMethods: {
      associate: function(models) {
        models.composition.belongsTo(models.user);
        models.composition.hasMany(models.critique);
      }
    }
  });
  return composition;
};