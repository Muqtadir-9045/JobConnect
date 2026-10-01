const AppError = require('../utils/AppError');
const { ROLES, JOB_TYPES, JOB_STATUS, APPLICATION_STATUS } = require('../utils/constants');
const { isString, isObjectId } = require('../utils/validators');

const fail = (errors) => {
  throw new AppError('Validation failed', 400, errors);
};

const values = (obj) => Object.values(obj);

const listQuery = (fields) => (req, res, next) => {
  const q = req.query;
  const errors = [];
  const out = { page: 1, limit: 20, filters: {} };

  for (const key of ['page', 'limit', ...Object.keys(fields)]) {
    if (q[key] !== undefined && !isString(q[key])) errors.push({ field: key, message: `${key} must be a single value` });
  }
  if (errors.length) fail(errors);

  for (const [key, max] of [['page', 100000], ['limit', 100]]) {
    if (q[key] === undefined) continue;
    const n = Number(q[key]);
    if (!/^\d+$/.test(q[key]) || n < 1 || n > max) errors.push({ field: key, message: `${key} must be an integer between 1 and ${max}` });
    else out[key] = n;
  }

  for (const [key, rule] of Object.entries(fields)) {
    const v = q[key];
    if (v === undefined) continue;
    if (rule === 'id' ? isObjectId(v) : rule.includes(v)) out.filters[key] = v;
    else errors.push({ field: key, message: rule === 'id' ? `${key} must be a valid id` : `${key} must be one of: ${rule.join(', ')}` });
  }

  if (errors.length) fail(errors);
  req.adminQuery = out;
  next();
};

const validateAdminId = (req, res, next) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid id', 400);
  next();
};

const validateUserStatusBody = (req, res, next) => {
  const { isActive } = req.body ?? {};
  if (typeof isActive !== 'boolean') fail([{ field: 'isActive', message: 'isActive must be true or false' }]);
  req.body = { isActive };
  next();
};

module.exports = {
  validateAdminId,
  validateUserStatusBody,
  validateUserList: listQuery({ role: values(ROLES), status: ['active', 'inactive'] }),
  validateJobList: listQuery({ status: values(JOB_STATUS), jobType: values(JOB_TYPES), company: 'id', postedBy: 'id' }),
  validateApplicationList: listQuery({ status: values(APPLICATION_STATUS), job: 'id', candidate: 'id' }),
};
