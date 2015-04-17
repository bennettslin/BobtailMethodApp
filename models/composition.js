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

      }
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

        // FIXME: This cascade delete does not work, needs a hook
        models.composition.hasMany(models.critique, {onDelete: "cascade", hooks: true});
      }
    }
  });
  return composition;
};