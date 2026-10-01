const { Job, Company, Application } = require('../models');
const AppError = require('../utils/AppError');
const { ROLES, JOB_STATUS } = require('../utils/constants');
const { paginationMeta } = require('../utils/pagination');

const COMPANY_FIELDS = 'name logoUrl website industry location';

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  salary: { 'salary.max': -1, createdAt: -1, _id: -1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const publicCondition = () => ({
  status: JOB_STATUS.OPEN,
  $or: [{ deadline: null }, { deadline: { $gte: new Date() } }],
});

const findPage = async (
  baseFilter,
  { page, limit, sort, filters },
  { populateCompany, select = '-description -__v' }
) => {
  const filter = { ...baseFilter };

  if (filters.q) filter.$text = { $search: filters.q };
  if (filters.location) filter.location = new RegExp(escapeRegex(filters.location), 'i');
  if (filters.jobType) filter.jobType = { $in: filters.jobType };
  if (filters.skills) filter.skills = { $in: filters.skills };
  if (filters.company) filter.company = filters.company;
  if (filters.minSalary !== undefined) filter['salary.max'] = { $gte: filters.minSalary };
  if (filters.maxExperience !== undefined) filter.experienceYears = { $lte: filters.maxExperience };

  const sortSpec =
    sort === 'relevance' && filters.q
      ? { score: { $meta: 'textScore' }, _id: -1 }
      : SORTS[sort] || SORTS.newest;

  let query = Job.find(filter)
    .select(select)
    .sort(sortSpec)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  if (populateCompany) query = query.populate('company', COMPANY_FIELDS);

  const [jobs, total] = await Promise.all([query, Job.countDocuments(filter)]);
  return { jobs, pagination: paginationMeta(total, page, limit) };
};

const notFoundOrForbidden = async (id) => {
  const exists = await Job.exists({ _id: id });
  return exists
    ? new AppError('You can only modify your own jobs', 403)
    : new AppError('Job not found', 404);
};

const listJobs = async (req, res) => {
  const result = await findPage(publicCondition(), req.jobQuery, {
    populateCompany: true,
    select: '-description -postedBy -__v',
  });
  res.json({ success: true, ...result });
};

const listMyJobs = async (req, res) => {
  const result = await findPage(
    { postedBy: req.user._id, ...(req.jobQuery.filters.status && { status: req.jobQuery.filters.status }) },
    req.jobQuery,
    { populateCompany: false }
  );
  res.json({ success: true, ...result });
};

const getJob = async (req, res) => {
  const { user } = req;
  const isAdmin = user?.role === ROLES.ADMIN;

  let filter;
  if (isAdmin) filter = { _id: req.params.id };
  else if (user) filter = { _id: req.params.id, $or: [{ postedBy: user._id }, publicCondition()] };
  else filter = { _id: req.params.id, ...publicCondition() };

  const job = await Job.findOne(filter).populate('company', `${COMPANY_FIELDS} description`).select('-__v').lean();
  if (!job) throw new AppError('Job not found', 404);

  if (!isAdmin && String(job.postedBy) !== String(user?._id)) delete job.postedBy;
  res.json({ success: true, job });
};

const createJob = async (req, res) => {
  if (!req.user.company || !(await Company.exists({ _id: req.user.company }))) {
    throw new AppError('Create your company profile before posting jobs', 400);
  }

  const job = await Job.create({ ...req.body, company: req.user.company, postedBy: req.user._id });
  res.status(201).json({ success: true, job });
};

const updateJob = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
  if (!job) throw await notFoundOrForbidden(req.params.id);

  const { salary, ...fields } = req.body;
  job.set(fields);
  if (salary) for (const [key, value] of Object.entries(salary)) job.set(`salary.${key}`, value);

  await job.save();
  res.json({ success: true, job });
};

const deleteJob = async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
  if (!job) throw await notFoundOrForbidden(req.params.id);

  await Application.deleteMany({ job: job._id });
  res.json({ success: true, message: 'Job deleted' });
};

module.exports = { listJobs, listMyJobs, getJob, createJob, updateJob, deleteJob };
