"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('users', 'lastname', {
      type: DataTypes.STRING
    }).done(done);
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('users', 'lastname').
    done(done);
  }
};
