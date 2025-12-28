const User = require('../models/User');

// Middleware to check if NGO is verified
const checkNGOVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // If user is NGO and not verified, block action
    if (user.role === 'ngo' && !user.isVerified) {
      return res.status(403).json({ 
        msg: 'Your NGO account is pending verification. You cannot perform this action until approved by an admin.',
        verificationStatus: user.verificationStatus
      });
    }
    
    // If NGO is rejected, block permanently
    if (user.role === 'ngo' && user.verificationStatus === 'rejected') {
      return res.status(403).json({ 
        msg: 'Your NGO verification was rejected. Please contact support.',
        verificationStatus: 'rejected'
      });
    }
    
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { checkNGOVerification, checkAdmin };
