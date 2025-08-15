const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getComplaints);

module.exports = router;