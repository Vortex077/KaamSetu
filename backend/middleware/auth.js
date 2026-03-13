const jwt = require('jsonwebtoken');
const Hirer = require('../models/Hirer');
const Worker = require('../models/Worker');

// Map role → Mongoose model
const modelMap = {
  hirer: Hirer,
  worker: Worker,
};

/**
 * JWT authentication middleware.
 * Decodes the token, reads the `role` claim, and fetches the user
 * from the correct collection (Hirer / Worker).
 */
const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const Model = modelMap[decoded.role];
    if (!Model) {
      return res.status(401).json({ success: false, error: 'Invalid role in token' });
    }

    const user = await Model.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * Role-based access control middleware.
 * Usage: router.get('/hirer-only', auth, authorize('hirer'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
