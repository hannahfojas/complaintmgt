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
    const complaint = await Complaint.create(payload);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.category) q.category = req.query.category;
    const complaints = await Complaint.find(q).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updatable = [
      'complainantName',
      'email',
      'phoneNumber',
      'title',
      'description',
      'category',
      'assignedTo'
    ];
    const update = {};
    for (const k of updatable) {
      if (k in req.body) update[k] = req.body[k];
    }
    const complaint = await Complaint.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const closeWithoutResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.status === 'Resolved' || complaint.status === 'Closed - No Resolution') {
      return res.json(complaint);
    }
    complaint.status = 'Closed - No Resolution';
    complaint.completionDate = new Date();
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Open', 'In Progress', 'Resolved', 'Closed - No Resolution'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // allow transitions from/to any state
    complaint.status = status;
    if (status === 'Resolved' || status === 'Closed - No Resolution') {
      complaint.completionDate = new Date();
    } else {
      complaint.completionDate = null;
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addResolutionNote = async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Note text is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });

    const done = complaint.status === 'Resolved' || complaint.status === 'Closed - No Resolution';
    if (!done) return res.status(400).json({ message: 'Allowed only when complaint is completed' });

    complaint.resolutionNotes = complaint.resolutionNotes || [];
    complaint.resolutionNotes.push({ text: text.trim(), author: (author || 'Staff').trim() });
    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaintDetails,
  closeWithoutResolution,
  updateComplaintStatus,
  addResolutionNote
};