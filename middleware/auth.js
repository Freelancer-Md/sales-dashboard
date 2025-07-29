import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';
import Admin from '../models/Admin.js';
import TeamLead from '../models/TeamLead.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    switch (decoded.role) {
      case 'super_admin':
        user = await SuperAdmin.findById(decoded.userId);
        break;
      case 'admin':
        user = await Admin.findById(decoded.userId);
        break;
      case 'tl':
        user = await TeamLead.findById(decoded.userId);
        break;
      default:
        return res.status(403).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = { ...decoded, userData: user };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};