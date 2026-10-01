const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/token');

const dummyHash = bcrypt.hash('jobconnect-dummy-password', 12);

const sendAuth = (res, status, user) => {
  res.status(status).json({ success: true, token: signToken(user._id), user });
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendAuth(res, 201, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const passwordOk = await bcrypt.compare(password, user ? user.password : await dummyHash);

  if (!user || !passwordOk) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('This account has been deactivated', 403);

  sendAuth(res, 200, user);
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
