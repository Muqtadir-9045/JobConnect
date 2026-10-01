const express = require('express');
const {
  listJobs,
  listMyJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { applyToJob, listJobApplications } = require('../controllers/applicationController');
const { validateApplyBody, validateApplicationQuery } = require('../middleware/validateApplication');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { publicLimiter } = require('../middleware/rateLimiter');
const { handleResumeUpload } = require('../utils/resumeStorage');
const {
  validateJobId,
  validateJobCreate,
  validateJobUpdate,
  validateJobQuery,
} = require('../middleware/validateJob');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get('/', publicLimiter, validateJobQuery, listJobs);

router.get('/mine', protect, authorize(ROLES.RECRUITER), validateJobQuery, listMyJobs);

router.get('/:id', publicLimiter, optionalAuth, validateJobId, getJob);

router.use(protect);

router.post('/', authorize(ROLES.RECRUITER), validateJobCreate, createJob);

router.post(
  '/:id/applications',
  authorize(ROLES.CANDIDATE),
  validateJobId,
  handleResumeUpload,
  validateApplyBody,
  applyToJob
);
router.get('/:id/applications', authorize(ROLES.RECRUITER), validateJobId, validateApplicationQuery, listJobApplications);

router.patch('/:id', authorize(ROLES.RECRUITER), validateJobId, validateJobUpdate, updateJob);
router.delete('/:id', authorize(ROLES.RECRUITER), validateJobId, deleteJob);

module.exports = router;
