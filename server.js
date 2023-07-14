const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configration/connection');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morganLog = require('morgan');
const winston = require('winston');
const mongoose = require('mongoose');
mongoose.set('strictQuery',false);
dotenv.config();
const PORT = process.env.PORT || 8080;
const crypto = require('crypto');
const nodeMailer = require('nodemailer');
const logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

app.use(
  morganLog('tiny', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);
// app.use(morganLog('tiny'));
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
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/', require('./routers'));
app.use('*',(req,res) => {
  return res.json({
    status: false,
    message: 'This Page Is not Found . Please Click Valid Route',
  });
});
app.use((err, req, res, next) => {
  logger.error(err.message);
  next();
});
// // Function to check the database connection status
// const checkDatabaseConnection = () => {
//   const isConnected = mongoose.connection.readyState === 1; // 1 = connected

//   if (isConnected) {
//     console.log('Database connection is active');
//   } else {
//     console.log('Database connection is not active');
//   }
// };

connectDB().then(() => {
//  checkDatabaseConnection();
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
});
