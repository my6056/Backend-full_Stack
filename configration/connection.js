const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongodb connection
    const con = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const isConnected = mongoose.connection.readyState === 1; // 1 = connected
    if (isConnected) {
      console.log(
        `MongoDB Database connected in Successfully and Database connection is active in : ${con.connection.host}`
      );
    } else {
      console.log('Database connection is not active');
    }
  } catch (err) {
    process.exit(1);
  }
};

module.exports = connectDB;

