const mongoose = require('mongoose');
require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');

mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
})
.catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏱️  Connection timeout - check your MongoDB URI and network');
    process.exit(1);
}, 10000);
