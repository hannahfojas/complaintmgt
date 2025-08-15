const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaintDetails,
  closeWithoutResolution
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getComplaints);
router.put('/:id', updateComplaintDetails);
router.patch('/:id/close-no-resolution', closeWithoutResolution);

module.exports = router;