const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configration/connection');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morganLog = require('morgan');
const mongoose = require('mongoose');
dotenv.config({ path: 'config.env' });
const PORT = process.env.PORT || 8080;
const crypto = require('crypto');
const nodeMailer = require('nodemailer');
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONT_END_HOME_URL,
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true,
  })
);
// Add a middleware to explicitly allow the required headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONT_END_HOME_URL);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(cookieParser());
app.use(morganLog('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/', require('./routers'));

// Function to check the database connection status
const checkDatabaseConnection = () => {
  const isConnected = mongoose.connection.readyState === 1; // 1 = connected

  if (isConnected) {
    console.log('Database connection is active');
  } else {
    console.log('Database connection is not active');
  }
};

connectDB().then(() => {
 setInterval(checkDatabaseConnection, 5 * 60 * 1000);
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
});
