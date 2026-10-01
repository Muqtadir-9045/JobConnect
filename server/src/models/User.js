const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');
const { isPhone } = require('../utils/validators');

const MIN_YEAR = 1950;
const maxYear = () => new Date().getFullYear() + 10;

const maxItems = (max, label) => ({
  validator: (arr) => arr.length <= max,
  message: `You can list at most ${max} ${label}`,
});

const yearField = (label) => ({
  type: Number,
  validate: [
    { validator: Number.isInteger, message: `${label} must be a whole number` },
    { validator: (v) => v >= MIN_YEAR && v <= maxYear(), message: `${label} is out of range` },
  ],
});

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: [true, 'Institution is required'], trim: true, maxlength: 120 },
    degree: { type: String, required: [true, 'Degree is required'], trim: true, maxlength: 120 },
    fieldOfStudy: { type: String, trim: true, maxlength: 120 },
    startYear: yearField('Start year'),
    endYear: {
      ...yearField('End year'),
      validate: [
        ...yearField('End year').validate,
        {
          validator: function (v) {
            return v == null || this.startYear == null || v >= this.startYear;
          },
          message: 'End year cannot be before start year',
        },
      ],
    },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 120 },
    company: { type: String, required: [true, 'Company is required'], trim: true, maxlength: 120 },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.startDate || v >= this.startDate;
        },
        message: 'End date cannot be before start date',
      },
    },
    description: { type: String, trim: true, maxlength: [1000, 'Description cannot exceed 1000 characters'] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: { values: Object.values(ROLES), message: '{VALUE} is not a valid role' },
      default: ROLES.CANDIDATE,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },

    phone: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || isPhone(v), message: 'Please provide a valid phone number' },
    },
    location: { type: String, trim: true, maxlength: [120, 'Location cannot exceed 120 characters'] },
    bio: { type: String, trim: true, maxlength: [1000, 'Bio cannot exceed 1000 characters'] },
    skills: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
      validate: maxItems(30, 'skills'),
    },
    education: { type: [educationSchema], validate: maxItems(10, 'education entries') },
    experience: { type: [experienceSchema], validate: maxItems(20, 'experience entries') },
    resume: {
      filename: { type: String, trim: true },
      originalName: { type: String, trim: true, maxlength: [255, 'Resume file name cannot exceed 255 characters'] },
      mimeType: { type: String, trim: true },
      size: { type: Number, min: [0, 'Resume size cannot be negative'] },
      uploadedAt: { type: Date },
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ createdAt: -1, _id: -1 });
userSchema.index({ role: 1, createdAt: -1, _id: -1 });
userSchema.index({ isActive: 1, createdAt: -1, _id: -1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);
