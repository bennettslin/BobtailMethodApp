"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('compositions', 'title', {
      type: DataTypes.STRING
    }).done(done);
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('compositions', 'title').
    done(done);
  }
};