const router = require('express').Router();
const userRoutes = require('./UserRoutes');
router.get('/', (req, res) => {
  return res.json({
      status:true,
      message: 'Backend Working fine'
  });
});
router.use('/user', userRoutes);
module.exports = router;
