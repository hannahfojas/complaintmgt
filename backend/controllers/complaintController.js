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
    const doc = await Complaint.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });
    if (!doc) return res.status(404).json({ message: 'Complaint not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const closeWithoutResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Complaint.findById(id);
    if (!doc) return res.status(404).json({ message: 'Complaint not found' });
    if (doc.status === 'Resolved' || doc.status === 'Closed - No Resolution') {
      return res.json(doc);
    }
    doc.status = 'Closed - No Resolution';
    doc.completionDate = new Date();
    await doc.save();
    res.json(doc);
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

    const doc = await Complaint.findById(id);
    if (!doc) return res.status(404).json({ message: 'Complaint not found' });

    // allow transitions from/to any state
    doc.status = status;
    if (status === 'Resolved' || status === 'Closed - No Resolution') {
      doc.completionDate = new Date();
    } else {
      doc.completionDate = null;
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addResolutionNote = async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Note text is required' });

    const doc = await Complaint.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const done = doc.status === 'Resolved' || doc.status === 'Closed - No Resolution';
    if (!done) return res.status(400).json({ message: 'Allowed only when complaint is completed' });

    doc.resolutionNotes = doc.resolutionNotes || [];
    doc.resolutionNotes.push({ text: text.trim(), author: (author || 'Staff').trim() });
    const updated = await doc.save();
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