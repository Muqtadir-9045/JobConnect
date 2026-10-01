const express = require('express');
const {
  listMyApplications,
  getApplication,
  downloadResume,
  updateApplicationStatus,
  withdrawApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateApplicationId,
  validateStatusBody,
  validateApplicationQuery,
} = require('../middleware/validateApplication');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.get('/mine', authorize(ROLES.CANDIDATE), validateApplicationQuery, listMyApplications);
router.get('/:id', authorize(ROLES.CANDIDATE, ROLES.RECRUITER), validateApplicationId, getApplication);
router.get(
  '/:id/resume',
  authorize(ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN),
  validateApplicationId,
  downloadResume
);
router.patch('/:id/status', authorize(ROLES.RECRUITER), validateApplicationId, validateStatusBody, updateApplicationStatus);
router.patch('/:id/withdraw', authorize(ROLES.CANDIDATE), validateApplicationId, withdrawApplication);

module.exports = router;
