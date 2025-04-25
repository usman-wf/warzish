
import express from 'express';
import process from 'process';
import { router } from './routes/authRoutes.js'; // Import the route file
import cors from "cors";

const PORT = 3030; 
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use('/')


// Connect to MongoDB using Mongoose:
import connectToMongoDB from './db/mongoose.js';
async function startServer() {
    try {
      await connectToMongoDB();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  
  startServer();



