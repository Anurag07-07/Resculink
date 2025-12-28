const Request = require('../models/Request');
const User = require('../models/User');
const { classifyUrgency } = require('../ai/urgencyClassifier');

exports.createRequest = async (req, res) => {
  try {
    const { title, description, category, location, imageUrl } = req.body;
    
    // AI Classification
    const urgency = classifyUrgency(title + " " + description);
    
    const newRequest = new Request({
      title,
      description,
      category,
      urgency,
      location,
      imageUrl,
      userId: req.user.id
    });
    
    const request = await newRequest.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('newRequest', request);
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let request = await Request.findById(req.params.id);
        
        if (!request) return res.status(404).json({ msg: 'Request not found' });
        
        // Fetch user from DB to check verification status
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(401).json({ msg: 'User not found' });

        // Check Authorization
        if (status === 'resolved') {
            const isOwner = request.userId.toString() === req.user.id;
            const isAdminOrNGO = currentUser.role === 'admin' || currentUser.role === 'ngo';
            const isVerified = currentUser.isVerified;
            
            // If NGO is resolving, check if they're associated with the assigned volunteer
            if (currentUser.role === 'ngo' && request.assignedTo) {
                const assignedVolunteer = await User.findById(request.assignedTo);
                
                if (!assignedVolunteer || assignedVolunteer.associatedNGO?.toString() !== currentUser._id.toString()) {
                    return res.status(401).json({ 
                        msg: 'You can only resolve requests assigned to your organization\'s volunteers.' 
                    });
                }
            }
            
            // Only allow if Owner OR (Admin/NGO AND Verified)
            if (!isOwner && (!isAdminOrNGO || !isVerified)) {
                return res.status(401).json({ msg: 'Not authorized to resolve this request. Verification required.' });
            }
            request.resolvedAt = Date.now();
        }

        request.status = status;
        if (status === 'in-progress') {
            request.assignedTo = req.user.id;
        }
        
        await request.save();
        
        const io = req.app.get('io');
        io.emit('updateRequest', request);
        
        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

exports.acceptTask = async (req, res) => {
    try {
        let request = await Request.findById(req.params.id).populate('userId', 'name email phone');
        
        if (!request) return res.status(404).json({ msg: 'Request not found' });
        
        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request already accepted or resolved' });
        }
        
        // Update request
        request.status = 'in-progress';
        request.assignedTo = req.user.id;
        await request.save();
        
        // Populate assignedTo with volunteer details
        await request.populate('assignedTo', 'name email phone');
        
        // Emit real-time update
        const io = req.app.get('io');
        io.emit('updateRequest', request);
        
        res.json({ 
            request,
            victimContact: {
                name: request.userId.name,
                email: request.userId.email,
                phone: request.userId.phone
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
