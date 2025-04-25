// File: server.js

// Require Express and set up your Express app:
const express = require('express');
const { router, authenticateToken } = require('./routes/authRoutes'); // Import the route file
var cors=require("cors");


const app = express();
const PORT = process.env.PORT || 3000; // You can change the port number if needed

app.use(express.json()); // Middleware to parse JSON requests
app.use(cors());

// Connect to MongoDB using Mongoose:
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/warzishPlanner', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


app.use('/api', router);
// Define some routes:
// Sample route
// app.get('/api/workouts', (req, res) => {
//     // Fetch workouts from MongoDB and send them as a response
//     res.json({ message: 'List of workouts' });
// });

// Start the server:
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
