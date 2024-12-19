const express = require('express');
const routes = require('./routes');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:5175', // Replace with your frontend's address
    methods: ['POST', 'GET']        // Allow specific HTTP methods
  }));

  app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
