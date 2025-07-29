import mongoose from 'mongoose';

const salespersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  team_lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamLead',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Salesperson', salespersonSchema);