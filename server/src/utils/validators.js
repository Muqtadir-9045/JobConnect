const isString = (v) => typeof v === 'string';
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isObjectId = (v) => isString(v) && /^[a-f\d]{24}$/i.test(v);

const isHttpUrl = (v) => {
  if (!isString(v)) return false;
  try {
    const { protocol } = new URL(v);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const PHONE_RE = /^\+?[0-9\s\-().]{7,20}$/;
const isPhone = (v) => isString(v) && PHONE_RE.test(v) && (v.match(/\d/g) || []).length >= 7;

module.exports = { isString, isNumber, isPlainObject, isObjectId, isHttpUrl, isPhone };
