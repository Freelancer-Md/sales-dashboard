import express from 'express';
import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';
import Admin from '../models/Admin.js';
import TeamLead from '../models/TeamLead.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    let user;
    let userModel;

    switch (role) {
      case 'super_admin':
        user = await SuperAdmin.findOne({ email });
        userModel = 'SuperAdmin';
        break;
      case 'admin':
        user = await Admin.findOne({ email });
        userModel = 'Admin';
        break;
      case 'tl':
        user = await TeamLead.findOne({ email });
        userModel = 'TeamLead';
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role, userModel },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        last_login: user.last_login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;