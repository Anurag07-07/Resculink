const User = require('../models/User');

// @desc    Get all verified NGOs for dropdown selection
// @route   GET /api/ngos/verified
// @access  Public
exports.getVerifiedNGOs = async (req, res) => {
    try {
        const ngos = await User.find({ 
            role: 'ngo', 
            isVerified: true 
        }).select('_id organizationName name');
        
        res.json(ngos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
