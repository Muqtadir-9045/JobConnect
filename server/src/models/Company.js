const mongoose = require('mongoose');
const { isHttpUrl } = require('../utils/validators');

const urlField = (label) => ({
  type: String,
  trim: true,
  maxlength: [500, `${label} cannot exceed 500 characters`],
  validate: {
    validator: (v) => !v || isHttpUrl(v),
    message: `${label} must be a valid http(s) URL`,
  },
});

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    industry: { type: String, trim: true, maxlength: [100, 'Industry cannot exceed 100 characters'] },
    website: urlField('Website'),
    location: { type: String, trim: true, maxlength: [120, 'Location cannot exceed 120 characters'] },
    logoUrl: urlField('Logo URL'),
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company creator is required'],
    },
  },
  { timestamps: true }
);

companySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
companySchema.index({ createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);
