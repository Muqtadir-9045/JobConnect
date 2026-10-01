const AppError = require('../utils/AppError');
const { isString, isObjectId, isHttpUrl } = require('../utils/validators');

const FIELDS = {
  name: { min: 2, max: 100, required: true },
  description: { max: 2000 },
  industry: { max: 100 },
  location: { max: 120 },
  website: { max: 500, url: true },
  logoUrl: { max: 500, url: true },
};

const validateCompanyId = (req, res, next) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid company id', 400);
  next();
};

const validateCompanyBody =
  ({ partial }) =>
  (req, res, next) => {
    const body = req.body ?? {};
    const data = {};
    const errors = [];
    const bad = (field, message) => errors.push({ field, message });

    for (const [field, rule] of Object.entries(FIELDS)) {
      const value = body[field];

      if (value === undefined || (value === null && !partial)) {
        if (!partial && rule.required) bad(field, `${field} is required`);
        continue;
      }
      if (value === null) {
        if (rule.required) bad(field, `${field} cannot be removed`);
        else data[field] = null;
        continue;
      }

      const min = rule.min ?? 1;
      if (!isString(value) || value.trim().length < min || value.trim().length > rule.max) {
        bad(field, `${field} must be ${min} to ${rule.max} characters`);
      } else if (rule.url && !isHttpUrl(value.trim())) {
        bad(field, `${field} must be a valid http(s) URL`);
      } else {
        data[field] = value.trim();
      }
    }

    if (partial && !errors.length && Object.keys(data).length === 0) {
      bad('body', 'Provide at least one field to update');
    }
    if (errors.length) throw new AppError('Validation failed', 400, errors);

    req.body = data;
    next();
  };

module.exports = {
  validateCompanyId,
  validateCompanyCreate: validateCompanyBody({ partial: false }),
  validateCompanyUpdate: validateCompanyBody({ partial: true }),
};
