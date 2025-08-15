const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    complainantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    assignedTo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed - No Resolution'],
      default: 'Open'
    },
    completionDate: { type: Date, default: null },
    resolutionNote: { type: String, default: '' } // will stay unused until US8
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Complaint', ComplaintSchema);