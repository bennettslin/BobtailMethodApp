"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.removeColumn('users', 'name').
    done(done);
  },

  down: function(migration, DataTypes, done) {
    migration.addColumn('users', 'name', {
      type: DataTypes.STRING
    }).done(done);
  }
};
