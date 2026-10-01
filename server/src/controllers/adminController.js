const { User, Company, Job, Application } = require('../models');
const AppError = require('../utils/AppError');
const { ROLES, JOB_STATUS, APPLICATION_STATUS } = require('../utils/constants');
const { paginationMeta } = require('../utils/pagination');

const NEWEST_FIRST = { createdAt: -1, _id: -1 };

const countsBy = (groups, allValues) => {
  const counts = Object.fromEntries(Object.values(allValues).map((v) => [v, 0]));
  for (const { _id, count } of groups) counts[_id] = count;
  return counts;
};
const sum = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);

const findPage = async (Model, filter, { page, limit }, configure) => {
  const query = configure(Model.find(filter).sort(NEWEST_FIRST).skip((page - 1) * limit).limit(limit).lean());
  const total = Object.keys(filter).length ? Model.countDocuments(filter) : Model.estimatedDocumentCount();
  const [items, count] = await Promise.all([query, total]);
  return { items, pagination: paginationMeta(count, page, limit) };
};

const groupCounts = async (Model, groupId, hint) => {
  const run = (useHint) => {
    const aggregation = Model.aggregate([{ $group: { _id: groupId, count: { $sum: 1 } } }]);
    return useHint ? aggregation.hint(hint) : aggregation;
  };
  try {
    return await run(true);
  } catch (err) {
    if (!/hint/i.test(err.message)) throw err;
    return run(false);
  }
};

const getDashboard = async (req, res) => {
  const [userGroups, jobGroups, applicationGroups, companies] = await Promise.all([
    groupCounts(User, { role: '$role', isActive: '$isActive' }, { role: 1, isActive: 1 }),
    groupCounts(Job, '$status', { status: 1, createdAt: -1, _id: -1 }),
    groupCounts(Application, '$status', { status: 1, createdAt: -1, _id: -1 }),
    Company.estimatedDocumentCount(),
  ]);

  const byRole = countsBy([], ROLES);
  let inactive = 0;
  for (const { _id, count } of userGroups) {
    byRole[_id.role] += count;
    if (_id.isActive === false) inactive += count;
  }
  const jobsByStatus = countsBy(jobGroups, JOB_STATUS);
  const applicationsByStatus = countsBy(applicationGroups, APPLICATION_STATUS);
  const totalUsers = sum(byRole);

  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, active: totalUsers - inactive, inactive, byRole },
      companies,
      jobs: { total: sum(jobsByStatus), byStatus: jobsByStatus },
      applications: { total: sum(applicationsByStatus), byStatus: applicationsByStatus },
    },
  });
};

const listUsers = async (req, res) => {
  const { page, limit, filters } = req.adminQuery;
  const filter = {
    ...(filters.role && { role: filters.role }),
    ...(filters.status && { isActive: filters.status === 'active' }),
  };

  const { items, pagination } = await findPage(User, filter, { page, limit }, (q) =>
    q.select('name email role isActive company createdAt')
  );
  res.json({ success: true, users: items, pagination });
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-__v')
    .populate('company', 'name industry website location')
    .lean();
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
};

const setUserStatus = async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new AppError('You cannot change the status of your own account', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { returnDocument: 'after' }
  )
    .select('name email role isActive company createdAt updatedAt')
    .lean();
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
};

const listJobs = async (req, res) => {
  const { page, limit, filters } = req.adminQuery;
  const { items, pagination } = await findPage(Job, filters, { page, limit }, (q) =>
    q
      .select('-description -__v')
      .populate('company', 'name')
      .populate('postedBy', 'name email')
  );
  res.json({ success: true, jobs: items, pagination });
};

const deleteJob = async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new AppError('Job not found', 404);

  await Application.deleteMany({ job: job._id });
  res.json({ success: true, message: 'Job deleted' });
};

const listApplications = async (req, res) => {
  const { page, limit, filters } = req.adminQuery;
  const { items, pagination } = await findPage(Application, filters, { page, limit }, (q) =>
    q
      .select('-coverLetter -__v')
      .populate('candidate', 'name email')
      .populate({ path: 'job', select: 'title status company', populate: { path: 'company', select: 'name' } })
  );
  res.json({ success: true, applications: items, pagination });
};

module.exports = { getDashboard, listUsers, getUser, setUserStatus, listJobs, deleteJob, listApplications };
