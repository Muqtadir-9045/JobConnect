const AppError = require('../utils/AppError');
const { APPLICATION_STATUS, RECRUITER_APPLICATION_STATUSES } = require('../utils/constants');
const { isString, isObjectId } = require('../utils/validators');

const fail = (errors) => {
  throw new AppError('Validation failed', 400, errors);
};

const validateApplicationId = (req, res, next) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid application id', 400);
  next();
};

const validateApplyBody = (req, res, next) => {
  const { coverLetter } = req.body ?? {};
  const errors = [];
  const data = {};

  if (coverLetter !== undefined) {
    if (isString(coverLetter) && coverLetter.trim().length <= 3000) {
      if (coverLetter.trim()) data.coverLetter = coverLetter.trim();
    } else {
      errors.push({ field: 'coverLetter', message: 'coverLetter must be text of up to 3000 characters' });
    }
  }

  if (errors.length) fail(errors);
  req.body = data;
  next();
};

const validateStatusBody = (req, res, next) => {
  const { status } = req.body ?? {};
  if (!isString(status) || !RECRUITER_APPLICATION_STATUSES.includes(status)) {
    fail([{ field: 'status', message: `status must be one of: ${RECRUITER_APPLICATION_STATUSES.join(', ')}` }]);
  }
  req.body = { status };
  next();
};

const validateApplicationQuery = (req, res, next) => {
  const q = req.query;
  const errors = [];
  const out = { page: 1, limit: 10 };

  for (const key of ['page', 'limit', 'status', 'job']) {
    if (q[key] !== undefined && !isString(q[key])) errors.push({ field: key, message: `${key} must be a single value` });
  }
  if (errors.length) fail(errors);

  for (const [key, max] of [['page', 100000], ['limit', 50]]) {
    if (q[key] === undefined) continue;
    const n = Number(q[key]);
    if (!/^\d+$/.test(q[key]) || n < 1 || n > max) errors.push({ field: key, message: `${key} must be an integer between 1 and ${max}` });
    else out[key] = n;
  }

  if (q.status !== undefined) {
    if (Object.values(APPLICATION_STATUS).includes(q.status)) out.status = q.status;
    else errors.push({ field: 'status', message: `status must be one of: ${Object.values(APPLICATION_STATUS).join(', ')}` });
  }

  if (q.job !== undefined) {
    if (isObjectId(q.job)) out.job = q.job;
    else errors.push({ field: 'job', message: 'job must be a valid id' });
  }

  if (errors.length) fail(errors);
  req.pageQuery = out;
  next();
};

module.exports = { validateApplicationId, validateApplyBody, validateStatusBody, validateApplicationQuery };
