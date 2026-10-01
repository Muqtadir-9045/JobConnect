const AppError = require('../utils/AppError');
const {
  verifyResumeSignature,
  storeResume,
  sendResume,
  removeResumeFile,
  removeResumeIfUnused,
} = require('../utils/resumeStorage');

const PROFILE_FIELDS = [
  '_id',
  'name',
  'email',
  'role',
  'phone',
  'location',
  'bio',
  'skills',
  'education',
  'experience',
  'resume',
  'createdAt',
  'updatedAt',
];

const toProfile = (user) => {
  const data = user.toJSON();
  return Object.fromEntries(PROFILE_FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));
};

const getMyProfile = async (req, res) => {
  res.json({ success: true, profile: toProfile(req.user) });
};

const updateMyProfile = async (req, res) => {
  for (const [field, value] of Object.entries(req.body)) {
    req.user.set(field, value === null ? undefined : value);
  }
  await req.user.save();
  res.json({ success: true, profile: toProfile(req.user) });
};

const uploadMyResume = async (req, res) => {
  if (!req.file) throw new AppError('Select a PDF, DOC or DOCX file to upload', 400);
  verifyResumeSignature(req.file);

  const previous = req.user.resume?.filename;
  req.user.resume = await storeResume(req.file, req.user._id);
  try {
    await req.user.save();
  } catch (err) {
    await removeResumeFile(req.user.resume.filename);
    throw err;
  }
  if (previous && previous !== req.user.resume.filename) await removeResumeIfUnused(previous);
  res.json({ success: true, profile: toProfile(req.user) });
};

const downloadMyResume = async (req, res) => {
  if (!req.user.resume?.filename) throw new AppError('You have not uploaded a resume yet', 404);

  await sendResume(res, req.user.resume);
};

const deleteMyResume = async (req, res) => {
  const previous = req.user.resume?.filename;
  req.user.resume = undefined;
  await req.user.save();
  await removeResumeIfUnused(previous);
  res.json({ success: true, profile: toProfile(req.user) });
};

module.exports = { getMyProfile, updateMyProfile, uploadMyResume, downloadMyResume, deleteMyResume };
