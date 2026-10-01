const path = require('path');
const { pipeline } = require('stream/promises');
const multer = require('multer');
const AppError = require('./AppError');
const { Application, User } = require('../models');
const {
  uploadResumeFile,
  findResumeFile,
  openResumeDownloadStream,
  deleteResumeFile,
  toFileId,
} = require('../config/gridfs');

const RESUME_DIR = path.join(__dirname, '..', '..', 'uploads', 'resumes');

const MAX_RESUME_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const SIGNATURES = [
  { mime: 'application/pdf', bytes: Buffer.from('%PDF-') },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
  { mime: 'application/msword', bytes: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) },
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) cb(null, true);
  else cb(new AppError('Resume must be a PDF, DOC or DOCX file', 400));
};

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE, files: 1 },
  fileFilter,
}).single('resume');

const handleResumeUpload = (req, res, next) => {
  resumeUpload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Resume must be 4MB or smaller'
          : err.code === 'LIMIT_UNEXPECTED_FILE'
            ? 'Only one resume file may be uploaded'
            : 'Could not process the uploaded file';
      return next(new AppError(message, 400));
    }
    next(err);
  });
};

const verifyResumeSignature = (file) => {
  const signature = SIGNATURES.find((s) => s.mime === file.mimetype);
  const matches =
    Boolean(signature) && file.buffer.subarray(0, signature.bytes.length).equals(signature.bytes);
  if (!matches) {
    throw new AppError('The uploaded file does not look like a valid PDF, DOC or DOCX', 400);
  }
};

const storeResume = async (file, owner) => {
  const fileId = await uploadResumeFile(file.buffer, {
    filename: file.originalname,
    mimeType: file.mimetype,
    metadata: { owner },
  });
  return {
    filename: String(fileId),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
};

const sendResume = async (res, resume) => {
  const file = await findResumeFile(resume.filename);
  if (!file) throw new AppError('The resume file is missing from storage', 404);

  res.attachment(resume.originalName || 'resume');
  res.set('Content-Type', resume.mimeType || file.metadata?.mimeType || 'application/octet-stream');
  res.set('Content-Length', String(file.length));
  try {
    await pipeline(openResumeDownloadStream(file._id), res);
  } catch (err) {
    if (!res.headersSent) throw err;
    if (err.code !== 'ERR_STREAM_PREMATURE_CLOSE') console.error(`Resume download failed: ${err.message}`);
    res.destroy();
  }
};

const removeResumeFile = async (filename) => {
  if (!toFileId(filename)) return;
  try {
    await deleteResumeFile(filename);
  } catch (err) {
    console.error(`Could not delete resume file ${filename}: ${err.message}`);
  }
};

const removeResumeIfUnused = async (filename) => {
  if (!filename) return;
  try {
    const [usedByApplication, usedByProfile] = await Promise.all([
      Application.exists({ 'resume.filename': filename }),
      User.exists({ 'resume.filename': filename }),
    ]);
    if (!usedByApplication && !usedByProfile) await removeResumeFile(filename);
  } catch (err) {
    console.error(`Could not clean up resume file ${filename}: ${err.message}`);
  }
};

module.exports = {
  RESUME_DIR,
  MAX_RESUME_SIZE,
  ALLOWED_TYPES,
  handleResumeUpload,
  verifyResumeSignature,
  storeResume,
  sendResume,
  removeResumeFile,
  removeResumeIfUnused,
};
