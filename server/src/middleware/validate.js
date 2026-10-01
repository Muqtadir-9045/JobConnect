const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { isString } = require('../utils/validators');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTRABLE_ROLES = [ROLES.CANDIDATE, ROLES.RECRUITER];

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body ?? {};
  const errors = [];

  if (!isString(name) || name.trim().length < 2 || name.trim().length > 80) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 80 characters' });
  }
  if (!isString(email) || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email' });
  }
  if (!isString(password) || password.length < 8 || Buffer.byteLength(password) > 72) {
    errors.push({ field: 'password', message: 'Password must be 8 to 72 characters' });
  }
  if (role !== undefined && !REGISTRABLE_ROLES.includes(role)) {
    errors.push({ field: 'role', message: `Role must be one of: ${REGISTRABLE_ROLES.join(', ')}` });
  }

  if (errors.length) throw new AppError('Validation failed', 400, errors);

  req.body = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: role ?? ROLES.CANDIDATE,
  };
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (!isString(email) || !isString(password) || !email.trim() || !password) {
    throw new AppError('Validation failed', 400, [
      { field: 'credentials', message: 'Email and password are required' },
    ]);
  }

  req.body = { email: email.trim().toLowerCase(), password };
  next();
};

module.exports = { validateRegister, validateLogin };
