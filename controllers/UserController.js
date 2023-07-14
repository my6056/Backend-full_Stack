const bcryptjs = require('bcryptjs');
const UserModel = require('../model/UserModel');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRETE_KEY;
const { encryptData, decryptData } = require('../configration/data_encryption');

module.exports.CreteAccount = async (req, res,next) => {
  const { userName, userEmail, userPassword, confirmPassword } = req.body;
  // Regular expression for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!emailRegex.test(userEmail)) {
    return res.json({
      status: false,
      message: 'Enter Valid Email Please.',
    });
  }
  if (!userName && !usernameRegex.test(userName)) {
    return res.json({
      status: false,
      message: 'Enter Valid UserName Please.',
    });
  }
  if (!passwordRegex.test(userPassword)) {
    return res.json({
      status: false,
      message: 'Enter Valid Password with special charector and min 6 digit',
    });
  }
  if (userPassword !== confirmPassword) {
    return res.json({
      status: false,
      message: 'Password And Confirm Password Did not match',
    });
  }
  const email = userEmail.toLowerCase();
  try {
    const user = await UserModel.findOne({ userEmail: email });
    if (user) {
      return res.json({
        status: false,
        message: 'User Already exists with this email',
      });
    }
    const hashedPassword = await bcryptjs.hash(userPassword, 15);
    // encryption
    const encryptedPassword = encryptData(hashedPassword);
    const newUser = await new UserModel({
      userEmail: email,
      userPassword: encryptedPassword,
      userName: userName,
    });
    await newUser.save();
    return res.json({
      status: true,
      message: 'Account Created Successfully',
    });
  } catch (error) {
    next(error);
    return res.json({ status: false, message: 'Internal Server Error' });
  }
};

module.exports.UserLoginJWT = async (req, res,next) => {
  // Extract email and password from request body
  const { userEmail, userPassword } = req.body;
  // Convert email to lowercase for case-insensitive comparison
  const validEmail = userEmail.toLowerCase();

  try {
    // Check if the user exists
    const userExists = await UserModel.findOne({ userEmail: validEmail });
    if (!userExists) {
      return res.json({
        status: false,
        message:
          'User Email Not Found or User Does Not Exist,Please Create New Account',
      });
    }
    // decrypt data
    const decryptPassword = decryptData(userExists.userPassword);

    const username = userExists.userName;
    // Verify the password
    const passwordMatch = await bcryptjs.compare(userPassword, decryptPassword);
    if (!passwordMatch) {
      return res.json({
        status: false,
        message: 'Incorrect Password Try Again !',
      });
    }

    // Create a token for authentication with expires Time
    const token = await jwt.sign(
      {
        userId: userExists._id,
        userName: username,
        userEmail: userExists.userEmail,
      },
      secretKey,
      {
        expiresIn: '7d',
      }
    );
    res.cookie('token', token);
    return res.json({
      status: true,
      message: 'Logged in successfull',
      token: token,
    });
  } catch (error) {
    // Return a 500 status (Internal Server Error) if an error occurs
    next(error);
    return res.json({
      status: false,
      message: `Error In Login User Account: ${error.message}`,
    });
  }
};

module.exports.UpdateUserDetails = async (req, res ,next) => {
  const { userId } = req.params;
  const updatedData = req.body;

  try {
    if (updatedData.userPassword) {
      const hashedPassword = await bcryptjs.hash(updatedData.userPassword, 15);
      const encryptedPassword = encryptData(hashedPassword);
      updatedData.userPassword = encryptedPassword;
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    if (!updatedUser) {
      return res.json({
        status: false,
        message: 'User Not Found to Update',
      });
    }
    return res.json({
      status: true,
      message: 'User Updated successfully',
    });
  } catch (error) {
    next(error);
    return res.json({
      status: false,
      message: `Error In Updating User Details : ${error.message}`,
    });
  }
};

module.exports.UserAccountDelete = async (req, res ,next) => {
  const { userId } = req.params;
  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.json({
        status: false,
        message: 'User Not Found to Delete',
      });
    }
    return res.json({
      status: true,
      message: 'User Deleted successfully',
    });
  } catch (error) {
    next(error);
    return res.json({
      status: false,
      message: `Error In Deleting User Account : ${error.message}`,
    });
  }
};
