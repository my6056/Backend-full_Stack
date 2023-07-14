const mongoose = require('mongoose');
// console.log(`MongoDB Database connected in Successfully : ${con.connection.host}`);
const connectDB = async () => {
  try {
    // mongodb connection
    const con = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const isConntected = await mongoose.connection.readyState === 1; // 1 = connected
    if(isConntected){
       console.log(`MongoDB Database is connected Successfully and Database connection is active on :  ${con.connection.host}`);
    }else{
      console.log('Database connection is not active');
    }
      
  } catch (err) {
    process.exit(1);
  }
};

module.exports = connectDB;

