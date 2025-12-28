const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, location, phone, organizationName, organizationEmail, associatedNGO } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    
    // Security: Only specific email can obtain Admin role
    if (role === 'admin' && email !== 'anurag07raj@gmail.com') {
      return res.status(403).json({ msg: 'Unauthorized: You cannot create an Admin account.' });
    }

    // Auto-promote hardcoded admin even if they selected something else (optional convenience)
    if (email === 'anurag07raj@gmail.com') {
      role = 'admin';
    }

    // Validate Volunteer NGO association
    if (role === 'volunteer' && !associatedNGO) {
      return res.status(400).json({ 
        msg: 'Volunteers must select an associated NGO' 
      });
    }

    // Validate NGO registration requirements
    if (role === 'ngo') {
      if (!organizationName || !organizationEmail) {
        return res.status(400).json({ 
          msg: 'NGO registration requires organization name and official email' 
        });
      }
      
      // Removed strict domain validation for Hackathon flexibility
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      location,
      phone,
      associatedNGO: role === 'volunteer' ? associatedNGO : undefined,
      organizationName: role === 'ngo' ? organizationName : undefined,
      organizationEmail: role === 'ngo' ? organizationEmail : undefined,
      isVerified: role === 'admin' ? true : (role === 'ngo' ? false : true), 
      verificationStatus: role === 'admin' ? 'approved' : (role === 'ngo' ? 'pending' : 'approved')
    });
    
    await user.save();
    
    const payload = { user: { id: user.id, role: user.role } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      
      const response = { 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus
        } 
      };
      
      // Add message for NGOs awaiting verification
      if (role === 'ngo') {
        const io = req.app.get('io');
        // Emit event to admins
        io.emit('newNGORegistration', user);

        response.msg = 'NGO account created! Awaiting admin verification. You will have limited permissions until approved.';
      }
      
      res.json(response);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
    
    const payload = { user: { id: user.id, role: user.role } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      
      const response = {
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus
        }
      };
      
      // Warning for unverified NGOs
      if (user.role === 'ngo' && !user.isVerified) {
        response.msg = 'Your NGO account is pending verification. Limited permissions.';
      }
      
      res.json(response);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
