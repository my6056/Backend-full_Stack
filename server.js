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
const fs = require('fs');
const path = require('path');
const tokenLogger = process.env.LOGGER_TOKEN;  //token to download logger file securely
const nodeMailer = require('nodemailer');
const crypto = require('crypto');
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
app.use((err, req, res, next) => {
  logger.error(err.message);
  next();
});
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.get('/logs', async (req, res) => {
  try {
    const { token } = req.query;
    if (token === tokenLogger) {
      const logsFilePath = path.join(__dirname, '', 'error.log');
      const logsStream = await fs.createReadStream(logsFilePath);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=error.log');
      logsStream.pipe(res);
      return;
    } else {
      return res.json({
        status: false,
        message: `Sorry ! You are not admin of this website`
      });
    }
  } catch (error) {
    return res.json({
      status: false,
      message: `Sorry ! Error In Downloading logges : ${error.message}`
    });
  }
});
app.use('/', require('./routers'));
app.use('*',(req,res) => {
  return res.json({
    status: false,
    message: 'This Page Is not Found . Please Click Valid Route',
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
});
