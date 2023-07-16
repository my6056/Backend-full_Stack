const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      require: true,
    },
    userEmail: {
      type: String,
      require: true,
      unique: true,
    },
    userPassword: {
      type: String,
      require: true,
    },
    passwordOtp: {
      type: Number,
      maxlength: 6,
    },
    passwordOtpExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = model('UserModel', UserSchema);
