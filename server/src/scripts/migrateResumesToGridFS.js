require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { uploadResumeFile, toFileId } = require('../config/gridfs');
const { User, Application } = require('../models');
const { RESUME_DIR } = require('../utils/resumeStorage');

const isLegacy = (filename) => Boolean(filename) && !toFileId(filename);

const run = async () => {
  await connectDB();

  const legacy = [
    ...new Set([
      ...(await User.distinct('resume.filename')).filter(isLegacy),
      ...(await Application.distinct('resume.filename')).filter(isLegacy),
    ]),
  ];
  if (legacy.length === 0) {
    console.log('No local resume files to migrate.');
    return;
  }

  let migrated = 0;
  const missing = [];
  for (const filename of legacy) {
    const filePath = path.join(RESUME_DIR, path.basename(filename));
    if (!fs.existsSync(filePath)) {
      missing.push(filename);
      continue;
    }

    const owner =
      (await User.findOne({ 'resume.filename': filename }).select('resume').lean()) ||
      (await Application.findOne({ 'resume.filename': filename }).select('candidate resume').lean());
    const fileId = await uploadResumeFile(fs.readFileSync(filePath), {
      filename: owner.resume.originalName || filename,
      mimeType: owner.resume.mimeType,
      metadata: { owner: owner.candidate || owner._id, migratedFrom: filename },
    });

    const update = { $set: { 'resume.filename': String(fileId) } };
    const [users, applications] = await Promise.all([
      User.updateMany({ 'resume.filename': filename }, update),
      Application.updateMany({ 'resume.filename': filename }, update),
    ]);
    console.log(`${filename} -> ${fileId} (${users.modifiedCount} profile(s), ${applications.modifiedCount} application(s))`);
    migrated++;
  }

  console.log(`Migrated ${migrated} resume file(s) to GridFS.`);
  if (missing.length) console.log(`Not found in ${RESUME_DIR} (left unchanged): ${missing.join(', ')}`);
};

run()
  .catch((err) => {
    console.error(`Resume migration failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
