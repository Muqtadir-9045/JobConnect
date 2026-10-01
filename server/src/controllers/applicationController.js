const { Application, Job } = require('../models');
const AppError = require('../utils/AppError');
const {
  ROLES,
  JOB_STATUS,
  APPLICATION_STATUS,
  APPLICATION_TRANSITIONS,
  ACTIVE_APPLICATION_STATUSES,
} = require('../utils/constants');
const { paginationMeta } = require('../utils/pagination');
const { verifyResumeSignature, storeResume, sendResume, removeResumeFile } = require('../utils/resumeStorage');

const CANDIDATE_FIELDS = 'name email phone location skills resume';
const CANDIDATE_DETAIL_FIELDS = `${CANDIDATE_FIELDS} bio education experience`;
const JOB_FIELDS = 'title location jobType status deadline company';
const COMPANY_FIELDS = 'name logoUrl';
const NEWEST_FIRST = { createdAt: -1, _id: -1 };

const notFound = () => new AppError('Application not found', 404);

const friendlyDuplicate = (err) =>
  err.code === 11000 ? new AppError('You have already applied to this job', 409) : err;

const findPage = async (filter, { page, limit }, { select, populate }) => {
  let query = Application.find(filter)
    .select(select)
    .sort(NEWEST_FIRST)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  for (const p of populate) query = query.populate(p);

  const [applications, total] = await Promise.all([query, Application.countDocuments(filter)]);
  return { applications, pagination: paginationMeta(total, page, limit) };
};

const applyToJob = async (req, res) => {
  const job = await Job.findById(req.params.id).select('status deadline').lean();
  if (!job) throw new AppError('Job not found', 404);
  if (job.status !== JOB_STATUS.OPEN || (job.deadline && job.deadline < new Date())) {
    throw new AppError('This job is no longer accepting applications', 400);
  }

  let resume;
  if (req.file) {
    verifyResumeSignature(req.file);
    resume = await storeResume(req.file, req.user._id);
  } else if (req.user.resume?.filename) {
    resume = req.user.resume;
  } else {
    throw new AppError('Upload a resume (or add one to your profile) to apply', 400);
  }

  let application;
  try {
    application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      resume,
      coverLetter: req.body.coverLetter,
    });
  } catch (err) {
    if (req.file) await removeResumeFile(resume.filename);
    throw friendlyDuplicate(err);
  }
  res.status(201).json({ success: true, application });
};

const listMyApplications = async (req, res) => {
  const { status, job } = req.pageQuery;
  const filter = { candidate: req.user._id, ...(status && { status }), ...(job && { job }) };
  const result = await findPage(filter, req.pageQuery, {
    select: '-coverLetter -__v',
    populate: [{ path: 'job', select: JOB_FIELDS, populate: { path: 'company', select: COMPANY_FIELDS } }],
  });
  res.json({ success: true, ...result });
};

const listJobApplications = async (req, res) => {
  const job = await Job.exists({ _id: req.params.id, postedBy: req.user._id });
  if (!job) {
    throw (await Job.exists({ _id: req.params.id }))
      ? new AppError('You can only view applications for your own jobs', 403)
      : new AppError('Job not found', 404);
  }

  const { status } = req.pageQuery;
  const result = await findPage({ job: req.params.id, ...(status && { status }) }, req.pageQuery, {
    select: '-coverLetter -__v',
    populate: [{ path: 'candidate', select: `${CANDIDATE_FIELDS} education experience` }],
  });
  res.json({ success: true, ...result });
};

const getApplication = async (req, res) => {
  let application;

  if (req.user.role === ROLES.CANDIDATE) {
    application = await Application.findOne({ _id: req.params.id, candidate: req.user._id })
      .select('-__v')
      .populate({ path: 'job', select: JOB_FIELDS, populate: { path: 'company', select: COMPANY_FIELDS } })
      .lean();
  } else {
    application = await Application.findById(req.params.id)
      .select('-__v')
      .populate({ path: 'job', select: `${JOB_FIELDS} postedBy`, populate: { path: 'company', select: COMPANY_FIELDS } })
      .populate('candidate', CANDIDATE_DETAIL_FIELDS)
      .lean();
    if (application && String(application.job?.postedBy) !== String(req.user._id)) application = null;
    if (application) delete application.job.postedBy;
  }

  if (!application) throw notFound();
  res.json({ success: true, application });
};

const downloadResume = async (req, res) => {
  const application = await Application.findById(req.params.id).select('candidate job resume').lean();
  if (!application) throw notFound();

  const isOwner = req.user.role === ROLES.CANDIDATE && String(application.candidate) === String(req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;
  const ownsJob =
    req.user.role === ROLES.RECRUITER && Boolean(await Job.exists({ _id: application.job, postedBy: req.user._id }));
  if (!isOwner && !isAdmin && !ownsJob) throw notFound();

  if (!application.resume?.filename) {
    throw new AppError('No resume file is available for this application', 404);
  }

  await sendResume(res, application.resume);
};

const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  const current = await Application.findById(req.params.id).select('job status').lean();
  if (!current || !(await Job.exists({ _id: current.job, postedBy: req.user._id }))) throw notFound();

  if (!APPLICATION_TRANSITIONS[current.status]?.includes(status)) {
    throw new AppError(`Cannot change an application from "${current.status}" to "${status}"`, 409);
  }

  const application = await Application.findOneAndUpdate(
    { _id: current._id, status: current.status },
    { status },
    { returnDocument: 'after', runValidators: true }
  ).select('-__v');
  if (!application) throw new AppError('The application was just changed by someone else; please refresh', 409);

  res.json({ success: true, application });
};

const withdrawApplication = async (req, res) => {
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, candidate: req.user._id, status: { $in: ACTIVE_APPLICATION_STATUSES } },
    { status: APPLICATION_STATUS.WITHDRAWN },
    { returnDocument: 'after' }
  ).select('-__v');

  if (!application) {
    const own = await Application.findOne({ _id: req.params.id, candidate: req.user._id }).select('status').lean();
    if (!own) throw notFound();
    throw new AppError(`This application can no longer be withdrawn (status: ${own.status})`, 409);
  }

  res.json({ success: true, application });
};

module.exports = {
  applyToJob,
  listMyApplications,
  listJobApplications,
  getApplication,
  downloadResume,
  updateApplicationStatus,
  withdrawApplication,
};
