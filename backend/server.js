const login = require('./routes/login');
const users = require('./routes/users');
const mongoose = require('mongoose');
const logger = require('./logger');
const morgan = require('morgan');
require('dotenv').config();
const express = require('express');
const app = express();

//Db Connections.
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => logger.info('Connected with database...'))
  .catch((error) => logger.error('Could not connected to database: ' + error));

//Middlewares.
app.use(express.json());
app.use(morgan('tiny'));

//Handling Routes.
app.use('/api/users/register', users);
app.use('/api/users/login', login);

//Port.
const port = process.env.PORT;
app.listen(port, function () {
  logger.info(`Listening on port http://localhost:${port}`);
});
