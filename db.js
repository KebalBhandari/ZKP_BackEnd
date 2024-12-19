const knex = require('knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './srp_auth.db', // Database file
  },
  useNullAsDefault: true,
});

// Create users table if not exists
db.schema.hasTable('users').then((exists) => {
  if (!exists) {
    return db.schema.createTable('users', (table) => {
      table.string('username').notNullable();
      table.string('email').primary();
      table.string('salt').notNullable();
      table.string('verifier').notNullable();
      table.boolean('active').notNullable();
    });
  }
});

db.schema.hasTable('userSession').then((exists) => {
  if (!exists) {
    return db.schema.createTable('userSession', (table) => {
      table.string('username').notNullable();
      table.string('email').primary();
      table.string('sessionId').notNullable();
      table.boolean('active').notNullable();
    });
  }
});

module.exports = db;
