const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaintDetails,
  closeWithoutResolution,
  updateComplaintStatus,
  addResolutionNote
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getComplaints);
router.put('/:id', updateComplaintDetails);
router.patch('/:id/close-no-resolution', closeWithoutResolution);
router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/notes', addResolutionNote);

module.exports = router;