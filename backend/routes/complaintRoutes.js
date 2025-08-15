const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaintDetails,
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getComplaints);
router.put('/:id', updateComplaintDetails);

module.exports = router;