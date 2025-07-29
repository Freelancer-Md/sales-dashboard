import express from 'express';
import Sales from '../models/Sales.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Export sales report
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'csv', from, to, team_lead_id, salesperson_id } = req.query;
    
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

    const sales = await Sales.find(filter)
      .populate('salesperson_id', 'name')
      .populate('team_lead_id', 'name')
      .sort({ date: -1 });

    if (format === 'csv') {
      const csv = generateCSV(sales);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
      res.send(csv);
    } else {
      res.json(sales);
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function generateCSV(sales) {
  const headers = ['Policy Number', 'Vehicle Number', 'Salesperson', 'Team Lead', 'Date', 'Status', 'Created At'];
  const rows = sales.map(sale => [
    sale.policy_number,
    sale.vehicle_number,
    sale.salesperson_id?.name || 'N/A',
    sale.team_lead_id?.name || 'N/A',
    sale.date.toDateString(),
    sale.status,
    sale.created_at.toDateString()
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
}

export default router;