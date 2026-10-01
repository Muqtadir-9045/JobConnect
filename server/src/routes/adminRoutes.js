const express = require('express');
const {
  getDashboard,
  listUsers,
  getUser,
  setUserStatus,
  listJobs,
  deleteJob,
  listApplications,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateAdminId,
  validateUserStatusBody,
  validateUserList,
  validateJobList,
  validateApplicationList,
} = require('../middleware/validateAdmin');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboard);

router.get('/users', validateUserList, listUsers);
router.get('/users/:id', validateAdminId, getUser);
router.patch('/users/:id/status', validateAdminId, validateUserStatusBody, setUserStatus);

router.get('/jobs', validateJobList, listJobs);
router.delete('/jobs/:id', validateAdminId, deleteJob);

router.get('/applications', validateApplicationList, listApplications);

module.exports = router;
