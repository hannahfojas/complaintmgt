const Complaint = require('../models/Complaint');

// Create Complaint
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

// Get Complaints
const getComplaints = async (req, res) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.category) q.category = req.query.category;
    const docs = await Complaint.find(q).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  createComplaint,
  getComplaints,
};