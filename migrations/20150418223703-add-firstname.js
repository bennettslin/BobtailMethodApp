"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('users', 'firstname', {
      type: DataTypes.STRING
    }).done(done);
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('users', 'firstname').
    done(done);
  }
};
