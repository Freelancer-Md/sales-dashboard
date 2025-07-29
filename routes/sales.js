import express from 'express';
import Sales from '../models/Sales.js';
import Salesperson from '../models/Salesperson.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all sales (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { from, to, team_lead_id, salesperson_id, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Role-based filtering
    if (req.user.role === 'tl') {
      filter.team_lead_id = req.user.userId;
    }
    
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    
    if (team_lead_id && req.user.role !== 'tl') {
      filter.team_lead_id = team_lead_id;
    }
    
    if (salesperson_id) {
      filter.salesperson_id = salesperson_id;
    }

    const skip = (page - 1) * limit;
    
    const sales = await Sales.find(filter)
      .populate('salesperson_id', 'name')
      .populate('team_lead_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Sales.countDocuments(filter);
    
    res.json({
      sales,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new sales entry
router.post('/add', authenticateToken, authorize(['tl', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { policy_number, vehicle_number, salesperson_id, date } = req.body;

    // Check if salesperson belongs to the TL (for TL role)
    if (req.user.role === 'tl') {
      const salesperson = await Salesperson.findById(salesperson_id);
      if (!salesperson || salesperson.team_lead_id.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'You can only add sales for your team members' });
      }
    }

    const salesDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for duplicate
    const existingSale = await Sales.findOne({
      policy_number,
      date: salesDate
    });

    if (existingSale) {
      return res.status(400).json({ message: 'Sale with this policy number and date already exists' });
    }

    // Get salesperson to get team_lead_id
    const salesperson = await Salesperson.findById(salesperson_id);
    if (!salesperson) {
      return res.status(404).json({ message: 'Salesperson not found' });
    }

    const isBackdated = salesDate < today;
    
    const salesEntry = new Sales({
      policy_number,
      vehicle_number,
      salesperson_id,
      team_lead_id: salesperson.team_lead_id,
      date: salesDate,
      status: isBackdated ? 'pending' : 'approved',
      created_by: req.user.userId,
      logs: [{
        action: 'created',
        by: req.user.role,
        user_id: req.user.userId,
        timestamp: new Date()
      }]
    });

    await salesEntry.save();
    
    await salesEntry.populate('salesperson_id', 'name');
    await salesEntry.populate('team_lead_id', 'name');

    res.status(201).json(salesEntry);
  } catch (error) {
    console.error('Add sales error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate sale entry' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Edit sales entry
router.put('/edit/:id', authenticateToken, authorize(['tl', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const sale = await Sales.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sales entry not found' });
    }

    // TL can only edit their team's sales
    if (req.user.role === 'tl' && sale.team_lead_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your team\'s sales' });
    }

    // Add to logs
    sale.logs.push({
      action: 'updated',
      by: req.user.role,
      user_id: req.user.userId,
      timestamp: new Date()
    });

    Object.assign(sale, updates);
    await sale.save();

    await sale.populate('salesperson_id', 'name');
    await sale.populate('team_lead_id', 'name');

    res.json(sale);
  } catch (error) {
    console.error('Edit sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete sales entry
router.delete('/delete/:id', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sales entry not found' });
    }

    await Sales.findByIdAndDelete(id);
    res.json({ message: 'Sales entry deleted successfully' });
  } catch (error) {
    console.error('Delete sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve sales entry
router.put('/approve/:id', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findById(id);
    if (!sale) {
      return res.status(404).json({ message: 'Sales entry not found' });
    }

    sale.status = 'approved';
    sale.logs.push({
      action: 'approved',
      by: req.user.role,
      user_id: req.user.userId,
      timestamp: new Date()
    });

    await sale.save();
    await sale.populate('salesperson_id', 'name');
    await sale.populate('team_lead_id', 'name');

    res.json(sale);
  } catch (error) {
    console.error('Approve sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;