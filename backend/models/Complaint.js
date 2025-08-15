const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    complainantName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phoneNumber: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    assignedTo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed - No Resolution'],
      default: 'Open'
    },
    completionDate: { type: Date, default: null },
    resolutionNote: { type: String, default: '' },
    resolutionNotes: [
        {
        text: { type: String, required: true},
        author: { type: String, default: 'Staff'},
        createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true, versionKey: false } );

module.exports = mongoose.model('Complaint', ComplaintSchema);