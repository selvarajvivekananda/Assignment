const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const login = require('./routes/login');

dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/', login);

app.listen(PORT, () => {
  console.log(`Your Server Is Running at PORT-${PORT}`);
});