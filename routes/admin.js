import express from 'express';
import Admin from '../models/Admin.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticateToken, authorize(['super_admin']), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newAdmin = new Admin({ name, email, password, phone });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (err) {
    console.error('Add Admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticateToken, authorize(['super_admin']), async (req, res) => {
  try {
    const admins = await Admin.find().sort({ created_at: -1 });
    res.json(admins);
  } catch (err) {
    console.error('Fetch Admins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
