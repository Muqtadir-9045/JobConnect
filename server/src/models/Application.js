const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate is required'],
    },
    resume: {
      filename: { type: String, trim: true },
      originalName: { type: String, trim: true, maxlength: [255, 'Resume file name cannot exceed 255 characters'] },
      mimeType: { type: String, trim: true },
      size: { type: Number, min: [0, 'Resume size cannot be negative'] },
      uploadedAt: { type: Date },
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: { values: Object.values(APPLICATION_STATUS), message: '{VALUE} is not a valid status' },
      default: APPLICATION_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ job: 1, createdAt: -1, _id: -1 });
applicationSchema.index({ job: 1, status: 1, createdAt: -1, _id: -1 });
applicationSchema.index({ candidate: 1, createdAt: -1, _id: -1 });
applicationSchema.index({ createdAt: -1, _id: -1 });
applicationSchema.index({ status: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Application', applicationSchema);
