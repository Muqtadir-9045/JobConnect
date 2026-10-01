const { Company, User } = require('../models');
const AppError = require('../utils/AppError');

const friendlyDuplicate = (err) => {
  if (err.code !== 11000) return err;
  if (err.keyPattern?.createdBy) return new AppError('You already have a company profile', 409);
  if (err.keyPattern?.name) return new AppError('A company with this name already exists', 409);
  return err;
};

const notFoundOrForbidden = async (id) => {
  const exists = await Company.exists({ _id: id });
  return exists
    ? new AppError('You can only modify your own company', 403)
    : new AppError('Company not found', 404);
};

const createCompany = async (req, res) => {
  if (req.user.company && (await Company.exists({ _id: req.user.company }))) {
    throw new AppError('You already have a company profile', 409);
  }

  let company;
  try {
    company = await Company.create({ ...req.body, createdBy: req.user._id });
  } catch (err) {
    throw friendlyDuplicate(err);
  }

  try {
    await User.updateOne({ _id: req.user._id }, { company: company._id });
  } catch (err) {
    await Company.deleteOne({ _id: company._id });
    throw err;
  }

  res.status(201).json({ success: true, company });
};

const getMyCompany = async (req, res) => {
  const company = req.user.company && (await Company.findById(req.user.company).select('-__v').lean());
  if (!company) throw new AppError('You have not created a company profile yet', 404);
  res.json({ success: true, company });
};

const getCompany = async (req, res) => {
  const company = await Company.findById(req.params.id).select('-__v -createdBy').lean();
  if (!company) throw new AppError('Company not found', 404);
  res.json({ success: true, company });
};

const updateCompany = async (req, res) => {
  const company = await Company.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!company) throw await notFoundOrForbidden(req.params.id);

  for (const [field, value] of Object.entries(req.body)) {
    company.set(field, value === null ? undefined : value);
  }

  try {
    await company.save();
  } catch (err) {
    throw friendlyDuplicate(err);
  }
  res.json({ success: true, company });
};

module.exports = { createCompany, getMyCompany, getCompany, updateCompany };
