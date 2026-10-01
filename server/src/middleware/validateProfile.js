const AppError = require('../utils/AppError');
const { isString, isPlainObject, isPhone } = require('../utils/validators');

const MAX_SKILLS = 30;
const MAX_EDUCATION = 10;
const MAX_EXPERIENCE = 20;
const MIN_YEAR = 1950;

const parseDate = (v) => {
  if (!isString(v) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? d : null;
};

const validateProfileUpdate = (req, res, next) => {
  const body = req.body ?? {};
  const data = {};
  const errors = [];
  const bad = (field, message) => {
    errors.push({ field, message });
    return null;
  };

  const text = (field, { min = 1, max, nullable = true }) => {
    const v = body[field];
    if (v === undefined) return;
    if (v === null) return nullable ? (data[field] = null) : bad(field, `${field} cannot be removed`);
    const t = isString(v) ? v.trim() : '';
    if (t.length < min || t.length > max) return bad(field, `${field} must be ${min} to ${max} characters`);
    data[field] = t;
  };
  text('name', { min: 2, max: 80, nullable: false });
  text('location', { max: 120 });
  text('bio', { max: 1000 });

  if (body.phone !== undefined) {
    if (body.phone === null) data.phone = null;
    else if (isString(body.phone) && isPhone(body.phone.trim())) data.phone = body.phone.trim();
    else bad('phone', 'phone must be a valid phone number (7 to 20 digits/symbols)');
  }

  if (body.skills !== undefined) {
    const ok =
      Array.isArray(body.skills) &&
      body.skills.length <= MAX_SKILLS &&
      body.skills.every((s) => isString(s) && s.trim() && s.trim().length <= 50);
    if (ok) data.skills = [...new Set(body.skills.map((s) => s.trim().toLowerCase()))];
    else bad('skills', `skills must be an array of up to ${MAX_SKILLS} non-empty strings (max 50 characters each)`);
  }

  const list = (field, max, validateItem) => {
    const items = body[field];
    if (items === undefined) return;
    if (!Array.isArray(items) || items.length > max) return bad(field, `${field} must be an array of up to ${max} entries`);
    const out = items.map((item, i) => {
      const path = `${field}[${i}]`;
      return isPlainObject(item) ? validateItem(item, path) : bad(path, 'must be an object');
    });
    if (out.every(Boolean)) data[field] = out;
  };

  list('education', MAX_EDUCATION, (item, path) => {
    const out = {};
    let ok = true;
    const required = (key) => {
      const v = item[key];
      if (isString(v) && v.trim() && v.trim().length <= 120) out[key] = v.trim();
      else ok = !!bad(`${path}.${key}`, `${key} is required (max 120 characters)`);
    };
    required('institution');
    required('degree');

    if (item.fieldOfStudy != null) {
      if (isString(item.fieldOfStudy) && item.fieldOfStudy.trim() && item.fieldOfStudy.trim().length <= 120) {
        out.fieldOfStudy = item.fieldOfStudy.trim();
      } else {
        ok = !!bad(`${path}.fieldOfStudy`, 'fieldOfStudy must be 1 to 120 characters');
      }
    }

    const maxYear = new Date().getFullYear() + 10;
    for (const key of ['startYear', 'endYear']) {
      if (item[key] == null) continue;
      if (Number.isInteger(item[key]) && item[key] >= MIN_YEAR && item[key] <= maxYear) out[key] = item[key];
      else ok = !!bad(`${path}.${key}`, `${key} must be a whole year between ${MIN_YEAR} and ${maxYear}`);
    }
    if (out.startYear && out.endYear && out.endYear < out.startYear) {
      ok = !!bad(`${path}.endYear`, 'endYear cannot be before startYear');
    }
    return ok ? out : null;
  });

  list('experience', MAX_EXPERIENCE, (item, path) => {
    const out = {};
    let ok = true;
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    for (const key of ['title', 'company']) {
      const v = item[key];
      if (isString(v) && v.trim() && v.trim().length <= 120) out[key] = v.trim();
      else ok = !!bad(`${path}.${key}`, `${key} is required (max 120 characters)`);
    }

    if (item.description != null) {
      if (isString(item.description) && item.description.trim().length <= 1000) {
        if (item.description.trim()) out.description = item.description.trim();
      } else {
        ok = !!bad(`${path}.description`, 'description must be text of up to 1000 characters');
      }
    }

    const start = parseDate(item.startDate);
    if (!start) ok = !!bad(`${path}.startDate`, 'startDate is required as a valid YYYY-MM-DD date');
    else if (start > tomorrow) ok = !!bad(`${path}.startDate`, 'startDate cannot be in the future');
    else out.startDate = start;

    if (item.endDate != null) {
      const end = parseDate(item.endDate);
      if (!end) ok = !!bad(`${path}.endDate`, 'endDate must be a valid YYYY-MM-DD date (omit it if this is your current job)');
      else if (end > tomorrow) ok = !!bad(`${path}.endDate`, 'endDate cannot be in the future');
      else if (start && end < start) ok = !!bad(`${path}.endDate`, 'endDate cannot be before startDate');
      else out.endDate = end;
    }
    return ok ? out : null;
  });

  if (!errors.length && Object.keys(data).length === 0) {
    bad('body', 'Provide at least one profile field to update');
  }
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  req.body = data;
  next();
};

module.exports = { validateProfileUpdate };
