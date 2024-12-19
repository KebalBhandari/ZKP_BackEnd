const db = require('./db');

const User = {
  // Create a new user
  create: async (username, email, salt, verifier, active) => {
    return db('users').insert({ username, email, salt, verifier, active });
  },

  createSession: async (username, email, sessionId, active) => {
    return db('userSession').insert({ username, email, sessionId, active });
  },

  // Find user by email
  findByUserEmail: async (email) => {
    return db('users').where({ email }).first();
  },

  // Check if email exists
  emailExists: async (email) => {
    const user = await db('users').where({ email }).first();
    return !!user; // Return true if user exists, otherwise false
  },
};

module.exports = User;

