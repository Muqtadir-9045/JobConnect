const express = require('express');
const { getMyProfile, updateMyProfile, uploadMyResume, downloadMyResume, deleteMyResume } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validateProfile');
const { ROLES } = require('../utils/constants');
const { handleResumeUpload } = require('../utils/resumeStorage');

const router = express.Router();

router.use(protect, authorize(ROLES.CANDIDATE));

router.get('/me', getMyProfile);
router.patch('/me', validateProfileUpdate, updateMyProfile);

router.get('/me/resume', downloadMyResume);
router.post('/me/resume', handleResumeUpload, uploadMyResume);
router.delete('/me/resume', deleteMyResume);

module.exports = router;
