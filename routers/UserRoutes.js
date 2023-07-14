const router = require('express').Router();
const {
  CreteAccount,
  UserLoginJWT,
  UpdateUserDetails,
  UserAccountDelete,
} = require('../controllers/UserController');

const {
  SendOtp,
  VerifyAndUpdatePassword,
} = require('../controllers/UserPassword');


router.post('/api/signup', CreteAccount);
router.post('/api/login', UserLoginJWT);
router.put('/api/update-user/:userId', UpdateUserDetails);
router.delete('/api/delete-user/:userId', UserAccountDelete);
router.post('/api/send-otp', SendOtp);
router.post('/api/verify-otp', VerifyAndUpdatePassword);

module.exports = router;
