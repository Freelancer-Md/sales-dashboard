import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import salesRoutes from './routes/sales.js';
import salespersonRoutes from './routes/salespersons.js';
import reportRoutes from './routes/reports.js';
import { seedDatabase } from './utils/seed.js';
import teamLeadsRoutes from './routes/teamleads.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/salespersons', salespersonRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/team-leads', teamLeadsRoutes);
app.use('/api/admins', adminRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed database with sample data
    await seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});