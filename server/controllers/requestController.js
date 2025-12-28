const Request = require('../models/Request');
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
        
        // Check Authorization
        if (status === 'resolved') {
            const isOwner = request.userId.toString() === req.user.id;
            const isAdminOrNGO = req.user.role === 'admin' || req.user.role === 'ngo';
            
            if (!isOwner && !isAdminOrNGO) {
                return res.status(401).json({ msg: 'Not authorized to resolve this request' });
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
