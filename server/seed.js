const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const seed = async () => {
    // Clear DB
    await User.deleteMany({});
    await Request.deleteMany({});

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password', salt);

    const victim = await new User({
        name: 'John Doe (Victim)',
        email: 'victim@test.com',
        password,
        role: 'victim',
        location: { lat: 12.9716, lng: 77.5946 },
        phone: '1234567890'
    }).save();

    const volunteer = await new User({
        name: 'Jane Smith (Volunteer)',
        email: 'volunteer@test.com',
        password,
        role: 'volunteer',
        location: { lat: 12.9816, lng: 77.6046 },
        isAvailable: true
    }).save();

    const ngo = await new User({
        name: 'Red Cross (NGO)',
        email: 'ngo@test.com',
        password,
        role: 'ngo'
    }).save();

    // Specific Admin User
    const adminPassword = await bcrypt.hash('anurag#@12', salt);
    await new User({
        name: 'Anurag Raj',
        email: 'anurag07raj@gmail.com',
        password: adminPassword,
        role: 'admin',
        phone: '+917464954996',
        isVerified: true,
        verificationStatus: 'approved'
    }).save();

    console.log('Users created');

    // Create Requests
    const requests = [
        {
            title: 'Trapped in flooded house',
            description: 'Water level rising, trapped on second floor. 3 people.',
            category: 'Rescue',
            urgency: 'critical',
            location: { lat: 12.9750, lng: 77.5900 },
            userId: victim._id
        },
        {
            title: 'Need food and water',
            description: 'No supply for 2 days. 2 kids.',
            category: 'Food',
            urgency: 'high',
            location: { lat: 12.9650, lng: 77.5800 },
            userId: victim._id
        },
        {
            title: 'Minor injuries',
            description: 'Cut on leg, need bandage.',
            category: 'Medical',
            urgency: 'medium',
            location: { lat: 12.9700, lng: 77.6100 },
            userId: victim._id
        }
    ];

    for (let req of requests) {
        await new Request(req).save();
    }

    console.log('Requests created');
    process.exit();
};

seed();
