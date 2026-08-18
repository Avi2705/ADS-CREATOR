import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import helmet from 'helmet';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/adhunter_db';

app.use(helmet());
app.use(cors());
app.use(express.json());

import authRoutes from './modules/auth/auth.routes';
import campaignRoutes from './modules/campaigns/campaign.routes';
import adminRoutes from './modules/admin/admin.routes';
import userRoutes from './modules/users/user.routes';
import freeAdRoutes from './modules/creatives/freeAd.routes';
import b2cRequestRoutes from './modules/creatives/b2cRequest.routes';
import socialRoutes from './modules/social/social.routes';

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ADD CREATOR API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai/free-ad', freeAdRoutes);
app.use('/api/b2c-requests', b2cRequestRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/social', socialRoutes);




// Connect to MongoDB and start server
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
