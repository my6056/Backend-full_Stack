const UserModel = require('../model/UserModel');
const otpGenerator = require('otp-generator');
const { transporter } = require('../configration/nodemailer');
const { encryptData } = require('../configration/data_encryption');
const bcryptjs = require('bcryptjs');

module.exports.SendOtp = async (req, res ,next) => {
  const { userEmail } = req.body;
  try {
    const userExists = await UserModel.findOne({ userEmail: userEmail });
    if (!userExists) {
      return res.json({
        status: false,
        message: 'User Not Found With This Email !',
      });
    }

    // Generate a 6-digit number for passwordOtp
    const Otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    userExists.passwordOtp = parseInt(Otp); // Convert the OTP to a number
    userExists.passwordOtpExpire = Date.now() + 10 * 60 * 1000; //10min
    await userExists.save();
    // Construct the password reset email
    const registeredEmail = userExists.userEmail;
    const mailOptions = {
      from: process.env.NODEMAILER_FROM_EMAIL,
      to: userExists.userEmail,
      cc: process.env.NODEMAILER_CC_EMAIL,
      subject: `Password Reset OTP Request`,
      html: getOtpEmailTemplate(Otp, registeredEmail),
    };
    await transporter.sendMail(mailOptions).then(() => {
      return res.json({
        status: true,
        message: 'Otp Send Successfully in your registered email',
      });
    }).catch((error) => {
      next(error);
        return res.json({
          status: false,
          message: `Error In Sending Otp : ${error.message}`,
        });
    });
    return;
  } catch (error) {
    console.log('Error in otp sending' ,error);
    next(error);
    return res.json({
      status: false,
      message: `Error In Sending Otp : ${error.message}`,
    });
  }
};

module.exports.VerifyAndUpdatePassword = async (req, res ,next) => {
  const { userEmail, passwordOtp, userPassword, confirmPassword } = req.body;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  try {
    const user = await UserModel.findOne({ userEmail: userEmail });
    if (!user) {
      return res.json({
        status: false,
        message: 'User not Valid',
      });
    }
    if (user.passwordOtp !== parseInt(passwordOtp)) {
      return res.json({
        status: false,
        message: 'Otp Is Not Valid !',
      });
    }
    if (user.passwordOtpExpire < Date.now()) {
      return res.json({
        status: false,
        message: 'Otp Expired',
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
        message: 'Both Password not matched',
      });
    }
    const hashedPassword = await bcryptjs.hash(userPassword, 15);
    // encryption
    const encryptedPassword = encryptData(hashedPassword);
    user.userPassword = encryptedPassword;
    user.passwordOtp = undefined;
    user.passwordOtpExpire = undefined;
    await user.save();
    return res.json({
      status: true,
      message: 'OTP verified and Password changed Successfully !',
    });
  } catch (error) {
    next(error);
    return res.json({
      status: false,
      message: `Failed to verify OTP and Update password : ${error.message}`,
    });
  }
};

// Function to generate the OTP email template HTML
const getOtpEmailTemplate = (Otp, userEmail) => {
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        /* CSS styles for the email template */
        body {
          font-family: Arial, sans-serif;
          color: #333333;
          margin: 0;
          padding: 0;
        }
  
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #dddddd;
          border-radius: 5px;
          background-color: #ffffff;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
  
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
  
        .logo h1 {
          color: #333333;
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          padding: 0;
        }
  
        .otp {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333333;
        }
  
        .info {
          text-align: center;
          margin-bottom: 20px;
        }
  
        .info p {
          color: #555555;
          font-size: 16px;
          line-height: 24px;
          margin: 0;
          padding: 0;
        }
  
        @media only screen and (max-width: 600px) {
          .container {
            padding: 10px;
          }
  
          .logo h1 {
            font-size: 24px;
          }
  
          .otp {
            font-size: 15px;
          }
          .OTP_STYLE{
            font-size: 20px;
            color: red;
            border-bottom: 1px solid black;
          }
  
          .info p {
            font-size: 14px;
            line-height: 20px;
          }
        }
      </style>
    </head>
  
    <body>
      <div class="container">
        <div class="logo">
          <h1>User Authentication</h1>
        </div>
        <div class="otp">Your OTP: <span class="OTP_STYLE">${Otp}</span></div>
        <div class="info">
          <p>
            We have sent this One-Time Password (OTP) to the email address
            associated with your account (${userEmail}). Please enter this OTP to
            complete the verification process.
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
  return html;
};
