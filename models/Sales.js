import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  policy_number: {
    type: String,
    required: true,
    trim: true
  },
  vehicle_number: {
    type: String,
    required: true,
    trim: true
  },
  salesperson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salesperson',
    required: true
  },
  team_lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamLead',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'approved'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  logs: [{
    action: {
      type: String,
      required: true
    },
    by: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate sales
salesSchema.index({ policy_number: 1, date: 1 }, { unique: true });

export default mongoose.model('Sales', salesSchema);