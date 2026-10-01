const express = require('express');
const {
  createCompany,
  getMyCompany,
  getCompany,
  updateCompany,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateCompanyId,
  validateCompanyCreate,
  validateCompanyUpdate,
} = require('../middleware/validateCompany');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.RECRUITER), validateCompanyCreate, createCompany);
router.get('/me', authorize(ROLES.RECRUITER), getMyCompany);
router.get('/:id', validateCompanyId, getCompany);
router.patch('/:id', authorize(ROLES.RECRUITER), validateCompanyId, validateCompanyUpdate, updateCompany);

module.exports = router;
