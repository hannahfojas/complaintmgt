const Complaint = require('../models/Complaint');

const createComplaint = async (req, res) => {
  try {
    const payload = {
      complainantName: req.body.complainantName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'Low',
      assignedTo: req.body.assignedTo || '',
      status: 'Open',
      completionDate: null,
      resolutionNote: ''
    };
    const doc = await Complaint.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createComplaint,
};