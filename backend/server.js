const error = require('./middleware/error');
const donationRoutes = require('./routes/donations');
const login = require('./routes/login');
const users = require('./routes/users');
const mongoose = require('mongoose');
const logger = require('./logger');
const morgan = require('morgan');
require('dotenv').config();
const express = require('express');
const app = express();

//JWT_SECRET configuration.
if (!process.env.JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
//Db Connections.
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => logger.info('Connected with database...'))
  .catch((error) => logger.error('Could not connected to database: ' + error));

//Middlewares.
app.use(express.json());
app.use(morgan('tiny'));

//Handling Routes.
app.use('/api/users', users);
app.use('/api/login', login);
app.use('/api/donations', donationRoutes);
app.use(error);

//Port.
const port = process.env.PORT;
app.listen(port, function () {
  logger.info(`Listening on port http://localhost:${port}`);
});
