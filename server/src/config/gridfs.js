const mongoose = require('mongoose');

const RESUME_BUCKET = 'resumes';

let bucket = null;
let bucketDb = null;

const getResumeBucket = () => {
  const { db } = mongoose.connection;
  if (!db) {
    throw new Error('MongoDB is not connected; call connectDB() before using GridFS');
  }
  if (!bucket || bucketDb !== db) {
    bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: RESUME_BUCKET });
    bucketDb = db;
  }
  return bucket;
};

const toFileId = (id) => {
  if (id instanceof mongoose.Types.ObjectId) return id;
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(String(id)) : null;
};

const uploadResumeFile = (buffer, { filename, mimeType, metadata = {} }) =>
  new Promise((resolve, reject) => {
    const upload = getResumeBucket().openUploadStream(filename, {
      metadata: { ...metadata, mimeType },
    });
    upload.once('error', reject);
    upload.once('finish', () => resolve(upload.id));
    upload.end(buffer);
  });

const findResumeFile = async (id) => {
  const fileId = toFileId(id);
  if (!fileId) return null;
  const [file] = await getResumeBucket().find({ _id: fileId }, { limit: 1 }).toArray();
  return file || null;
};

const openResumeDownloadStream = (id) => {
  const fileId = toFileId(id);
  if (!fileId) throw new Error('Invalid resume file id');
  return getResumeBucket().openDownloadStream(fileId);
};

const deleteResumeFile = async (id) => {
  const fileId = toFileId(id);
  if (!fileId) return false;
  try {
    await getResumeBucket().delete(fileId);
    return true;
  } catch (err) {
    if (err instanceof mongoose.mongo.MongoRuntimeError && /FileNotFound|File not found/i.test(err.message)) return false;
    throw err;
  }
};

module.exports = {
  RESUME_BUCKET,
  getResumeBucket,
  toFileId,
  uploadResumeFile,
  findResumeFile,
  openResumeDownloadStream,
  deleteResumeFile,
};
