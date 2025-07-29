import express from 'express';
import TeamLead from '../models/TeamLead.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// POST /api/team-leads/add
router.post('/add', authenticateToken, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingTL = await TeamLead.findOne({ email });
    if (existingTL) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newTL = new TeamLead({ name, email, password, phone });
    await newTL.save();

    res.status(201).json({ message: 'Team Lead created successfully', teamLead: newTL });
  } catch (err) {
    console.error('Add TL error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticateToken, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const teamLeads = await TeamLead.find().sort({ created_at: -1 });
    res.json(teamLeads);
  } catch (err) {
    console.error('Fetch Team Leads error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
