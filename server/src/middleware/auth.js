const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/token');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  let payload;
  try {
    payload = verifyToken(header.slice(7).trim());
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError('Account no longer exists or is deactivated', 401);
  }

  req.user = user;
  next();
};

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  let payload;
  try {
    payload = verifyToken(header.slice(7).trim());
  } catch {
    return next();
  }

  const user = await User.findById(payload.sub);
  if (user && user.isActive) req.user = user;
  next();
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };

module.exports = { protect, optionalAuth, authorize };
