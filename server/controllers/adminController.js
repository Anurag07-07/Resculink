const User = require('../models/User');

// @desc    Get all pending NGO verifications
// @route   GET /api/admin/pending-ngos
// @access  Private (Admin only)
exports.getPendingNGOs = async (req, res) => {
    try {
        const pendingNGOs = await User.find({ 
            role: 'ngo', 
            verificationStatus: 'pending' 
        }).select('-password');
        
        res.json(pendingNGOs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Verify or Reject an NGO
// @route   PUT /api/admin/verify-ngo/:id
// @access  Private (Admin only)
exports.verifyNGO = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status. Use approved or rejected' });
        }

        let ngo = await User.findById(req.params.id);
        
        if (!ngo) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        if (ngo.role !== 'ngo') {
            return res.status(400).json({ msg: 'User is not an NGO' });
        }

        ngo.verificationStatus = status;
        ngo.isVerified = status === 'approved';
        ngo.verifiedBy = req.user.id;
        ngo.verifiedAt = Date.now();
        
        await ngo.save();
        
        res.json({ 
            msg: `NGO ${status === 'approved' ? 'verified' : 'rejected'} successfully`,
            ngo 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
