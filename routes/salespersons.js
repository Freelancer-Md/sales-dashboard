import express from 'express';
import Salesperson from '../models/Salesperson.js';
import TeamLead from '../models/TeamLead.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all salespersons
router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    // TL can only see their team members
    if (req.user.role === 'tl') {
      filter.team_lead_id = req.user.userId;
    }

    const salespersons = await Salesperson.find(filter)
      .populate('team_lead_id', 'name')
      .sort({ created_at: -1 });

    res.json(salespersons);
  } catch (error) {
    console.error('Get salespersons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add salesperson
router.post('/add', authenticateToken, authorize(['tl', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { name, phone, team_lead_id } = req.body;

    // TL can only add to their own team
    const finalTeamLeadId = req.user.role === 'tl' ? req.user.userId : team_lead_id;

    // Verify team lead exists
    const teamLead = await TeamLead.findById(finalTeamLeadId);
    if (!teamLead) {
      return res.status(404).json({ message: 'Team lead not found' });
    }

    const salesperson = new Salesperson({
      name,
      phone,
      team_lead_id: finalTeamLeadId
    });

    await salesperson.save();
    await salesperson.populate('team_lead_id', 'name');

    res.status(201).json(salesperson);
  } catch (error) {
    console.error('Add salesperson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove salesperson
router.delete('/remove/:id', authenticateToken, authorize(['tl', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const salesperson = await Salesperson.findById(id);
    if (!salesperson) {
      return res.status(404).json({ message: 'Salesperson not found' });
    }

    // TL can only remove from their team
    if (req.user.role === 'tl' && salesperson.team_lead_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only remove your team members' });
    }

    await Salesperson.findByIdAndDelete(id);
    res.json({ message: 'Salesperson removed successfully' });
  } catch (error) {
    console.error('Remove salesperson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign salesperson to TL
router.put('/assign-to-tl/:id', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { team_lead_id } = req.body;

    const salesperson = await Salesperson.findById(id);
    if (!salesperson) {
      return res.status(404).json({ message: 'Salesperson not found' });
    }

    const teamLead = await TeamLead.findById(team_lead_id);
    if (!teamLead) {
      return res.status(404).json({ message: 'Team lead not found' });
    }

    salesperson.team_lead_id = team_lead_id;
    await salesperson.save();
    await salesperson.populate('team_lead_id', 'name');

    res.json(salesperson);
  } catch (error) {
    console.error('Assign salesperson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search salespersons
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    let filter = {};
    
    if (req.user.role === 'tl') {
      filter.team_lead_id = req.user.userId;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    const salespersons = await Salesperson.find(filter)
      .populate('team_lead_id', 'name')
      .limit(10);

    res.json(salespersons);
  } catch (error) {
    console.error('Search salespersons error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all team leads (for admin/super admin)
router.get('/team-leads', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const teamLeads = await TeamLead.find({}, 'name email')
      .sort({ name: 1 });

    res.json(teamLeads);
  } catch (error) {
    console.error('Get team leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;