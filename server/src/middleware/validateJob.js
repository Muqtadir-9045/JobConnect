const AppError = require('../utils/AppError');
const { JOB_TYPES, JOB_STATUS } = require('../utils/constants');
const { isString, isNumber, isPlainObject, isObjectId } = require('../utils/validators');

const JOB_TYPE_VALUES = Object.values(JOB_TYPES);
const JOB_STATUS_VALUES = Object.values(JOB_STATUS);
const SORTS = ['newest', 'oldest', 'salary', 'relevance'];


const fail = (errors) => {
  throw new AppError('Validation failed', 400, errors);
};

const validateJobId = (req, res, next) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid job id', 400);
  next();
};

const validateJobBody =
  ({ partial }) =>
  (req, res, next) => {
    const body = req.body ?? {};
    const data = {};
    const errors = [];
    const bad = (field, message) => errors.push({ field, message });

    const text = (field, max) => {
      const v = body[field];
      if (v === undefined) return partial || bad(field, `${field} is required`);
      if (!isString(v) || !v.trim() || v.trim().length > max) {
        return bad(field, `${field} must be 1 to ${max} characters`);
      }
      data[field] = v.trim();
    };
    text('title', 120);
    text('description', 5000);
    text('location', 120);

    if (body.jobType === undefined) {
      if (!partial) bad('jobType', 'jobType is required');
    } else if (!JOB_TYPE_VALUES.includes(body.jobType)) {
      bad('jobType', `jobType must be one of: ${JOB_TYPE_VALUES.join(', ')}`);
    } else {
      data.jobType = body.jobType;
    }

    if (body.status !== undefined) {
      if (JOB_STATUS_VALUES.includes(body.status)) data.status = body.status;
      else bad('status', `status must be one of: ${JOB_STATUS_VALUES.join(', ')}`);
    }

    if (body.skills !== undefined) {
      const ok =
        Array.isArray(body.skills) &&
        body.skills.length <= 30 &&
        body.skills.every((s) => isString(s) && s.trim() && s.trim().length <= 50);
      if (ok) data.skills = [...new Set(body.skills.map((s) => s.trim().toLowerCase()))];
      else bad('skills', 'skills must be an array of up to 30 non-empty strings (max 50 characters each)');
    }

    if (body.experienceYears !== undefined) {
      if (isNumber(body.experienceYears) && body.experienceYears >= 0 && body.experienceYears <= 60) {
        data.experienceYears = body.experienceYears;
      } else {
        bad('experienceYears', 'experienceYears must be a number between 0 and 60');
      }
    }

    if (body.salary !== undefined) {
      const s = body.salary;
      const salary = {};
      let ok = isPlainObject(s);
      if (ok) {
        for (const key of ['min', 'max']) {
          if (s[key] === undefined) continue;
          if (isNumber(s[key]) && s[key] >= 0) salary[key] = s[key];
          else ok = false;
        }
        if (s.currency !== undefined) {
          if (isString(s.currency) && /^[A-Za-z]{3}$/.test(s.currency)) salary.currency = s.currency.toUpperCase();
          else ok = false;
        }
        if (salary.min !== undefined && salary.max !== undefined && salary.max < salary.min) ok = false;
      }
      if (ok) data.salary = salary;
      else bad('salary', 'salary must be { min, max, currency } with non-negative numbers, max >= min, 3-letter currency');
    }

    if (body.deadline !== undefined) {
      if (body.deadline === null) {
        if (partial) data.deadline = null;
      } else {
        const d = isString(body.deadline) ? new Date(body.deadline) : null;
        if (!d || Number.isNaN(d.getTime())) bad('deadline', 'deadline must be a valid date');
        else if (d <= new Date()) bad('deadline', 'deadline must be in the future');
        else data.deadline = d;
      }
    }

    if (partial && !errors.length && Object.keys(data).length === 0) {
      bad('body', 'Provide at least one field to update');
    }
    if (errors.length) fail(errors);

    req.body = data;
    next();
  };

const validateJobQuery = (req, res, next) => {
  const q = req.query;
  const errors = [];
  const bad = (field, message) => errors.push({ field, message });
  const out = { page: 1, limit: 10, sort: 'newest', filters: {} };

  for (const key of ['page', 'limit', 'q', 'location', 'jobType', 'skills', 'company', 'minSalary', 'maxExperience', 'sort', 'status']) {
    if (q[key] !== undefined && !isString(q[key])) bad(key, `${key} must be a single value`);
  }
  if (errors.length) fail(errors);

  const int = (key, min, max) => {
    if (q[key] === undefined) return;
    const n = Number(q[key]);
    if (!/^\d+$/.test(q[key]) || n < min || n > max) bad(key, `${key} must be an integer between ${min} and ${max}`);
    else out[key] = n;
  };
  int('page', 1, 100000);
  int('limit', 1, 50);

  const trimmed = (key, max) => {
    if (q[key] === undefined) return undefined;
    const v = q[key].trim();
    if (!v || v.length > max) {
      bad(key, `${key} must be 1 to ${max} characters`);
      return undefined;
    }
    return v;
  };
  const search = trimmed('q', 100);
  if (search) out.filters.q = search;
  const location = trimmed('location', 100);
  if (location) out.filters.location = location;

  if (q.jobType !== undefined) {
    const types = [...new Set(q.jobType.split(',').map((t) => t.trim()))];
    if (types.every((t) => JOB_TYPE_VALUES.includes(t))) out.filters.jobType = types;
    else bad('jobType', `jobType must be one or more of: ${JOB_TYPE_VALUES.join(', ')} (comma-separated)`);
  }

  if (q.skills !== undefined) {
    const skills = [...new Set(q.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))];
    if (skills.length && skills.length <= 10 && skills.every((s) => s.length <= 50)) out.filters.skills = skills;
    else bad('skills', 'skills must be 1 to 10 comma-separated values');
  }

  if (q.company !== undefined) {
    if (isObjectId(q.company)) out.filters.company = q.company;
    else bad('company', 'company must be a valid id');
  }

  for (const key of ['minSalary', 'maxExperience']) {
    if (q[key] === undefined) continue;
    const n = Number(q[key]);
    if (q[key].trim() === '' || !Number.isFinite(n) || n < 0) bad(key, `${key} must be a non-negative number`);
    else out.filters[key] = n;
  }

  if (q.status !== undefined) {
    if (JOB_STATUS_VALUES.includes(q.status)) out.filters.status = q.status;
    else bad('status', `status must be one of: ${JOB_STATUS_VALUES.join(', ')}`);
  }

  if (q.sort !== undefined) {
    if (SORTS.includes(q.sort)) out.sort = q.sort;
    else bad('sort', `sort must be one of: ${SORTS.join(', ')}`);
  } else if (out.filters.q) {
    out.sort = 'relevance';
  }

  if (errors.length) fail(errors);
  req.jobQuery = out;
  next();
};

module.exports = { validateJobId, validateJobCreate: validateJobBody({ partial: false }), validateJobUpdate: validateJobBody({ partial: true }), validateJobQuery };
