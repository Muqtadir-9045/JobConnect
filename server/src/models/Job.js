const mongoose = require('mongoose');
const { JOB_TYPES, JOB_STATUS } = require('../utils/constants');

const salaryRange = (message) => ({
  validator: function () {
    const { min, max } = this.salary || {};
    return min == null || max == null || max >= min;
  },
  message,
});

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: { values: Object.values(JOB_TYPES), message: '{VALUE} is not a valid job type' },
      required: [true, 'Job type is required'],
    },
    skills: [{ type: String, trim: true, lowercase: true }],
    experienceYears: { type: Number, min: [0, 'Experience cannot be negative'], default: 0 },
    salary: {
      min: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
        validate: salaryRange('Minimum salary must be less than or equal to maximum salary'),
      },
      max: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
        validate: salaryRange('Maximum salary must be greater than or equal to minimum salary'),
      },
      currency: { type: String, default: 'USD', uppercase: true, trim: true },
    },
    deadline: { type: Date },
    status: {
      type: String,
      enum: { values: Object.values(JOB_STATUS), message: '{VALUE} is not a valid status' },
      default: JOB_STATUS.OPEN,
    },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1, _id: -1 });
jobSchema.index({ status: 1, jobType: 1, createdAt: -1, _id: -1 });
jobSchema.index({ status: 1, skills: 1, createdAt: -1, _id: -1 });
jobSchema.index({ company: 1, status: 1, createdAt: -1, _id: -1 });
jobSchema.index({ postedBy: 1, createdAt: -1, _id: -1 });
jobSchema.index({ createdAt: -1, _id: -1 });
jobSchema.index({ jobType: 1, createdAt: -1, _id: -1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
