const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getComplaints); //get complaint

module.exports = router;