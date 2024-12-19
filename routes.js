const express = require('express');
const bodyParser = require('body-parser');
const srp = require('secure-remote-password/server')
const User = require('./models');

const router = express.Router();

router.use(bodyParser.json());

let srpSessions = {}; // Temporary in-memory storage for SRP sessions

// Registration Route
router.post('/api/register', async (req, res) => {
  const { username, email, salt, verifier } = req.body;

  if (!username || !email || !salt || !verifier) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({ error: 'User already exists' });
    }
    else{
        await User.create(username, email, salt, verifier,1);
        res.json({ status: 'Registration successful' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Start Authentication
router.post('/api/authenticate/start', async (req, res) => {
  const { email, A } = req.body;

  if (!email || !A) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const user = await User.findByUserEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

  // Generate server ephemeral values
  const { salt, verifier } = user;
  const serverEphemeral =srp.generateEphemeral(verifier); 
  const secretEphemeral = serverEphemeral.secret;
  const publicEmphemeral = serverEphemeral.public;
  srpSessions[email] = { secretEphemeral, A, verifier, salt };

  res.json({
    salt,
    B: publicEmphemeral,
  });
});

// Finish Authentication
router.post('/api/authenticate/finish', async (req, res) => {
  const { email, M1 } = req.body;

  if (!email || !M1) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const session = srpSessions[email];
  if (!session) {
    return res.status(400).json({ error: 'Session not found' });
  }

  const { secretEphemeral, A, verifier, salt } = session;
  const serverSession = srp.deriveSession(secretEphemeral, A, salt, email, verifier, M1);

  // Return server proof
  res.json({ M2: serverSession.proof });
  delete srpSessions[email]; // Clear session
});

// router.post('/api/authenticate/session', async (req, res) => {
//   const { username, email, salt, } = req.body;

//   if (!email || !M1) {
//     return res.status(400).json({ error: 'Invalid input' });
//   }

//   const session = srpSessions[email];
//   if (!session) {
//     return res.status(400).json({ error: 'Session not found' });
//   }

//   const { secretEphemeral, A, verifier, salt } = session;
//   const serverSession = srp.deriveSession(secretEphemeral, A, salt, email, verifier, M1);

//   // Return server proof
//   res.json({ M2: serverSession.proof });
//   delete srpSessions[email]; // Clear session
// });

module.exports = router;
